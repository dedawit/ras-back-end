import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { RFQRepository } from '../persistence/rfq.repository';
import { CreateRFQDTO } from '../usecase/dto/create-rfq-dto';
import { UpdateRFQDTO } from '../usecase/dto/update-rfq-dto';
import { RFQ } from '../persistence/rfq.entity';
import { UserRepository } from 'src/modules/user/persistence/user.repository';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { Response } from 'express';
import { Category } from '../utility/enums/category.enum';
import { RFQState } from '../utility/enums/rfq-state.enum';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThan } from 'typeorm';
import { BidRepository } from 'src/modules/bid/persistence/bid.repository';
import { BidState } from 'src/modules/bid/usecase/utility/bid-state.enum';

@Injectable()
export class RFQService {
  private id: string;
  private title: string;
  private projectName: string;
  private purchaseNumber: string;
  private quantity: number;
  private category: Category;
  private detail: string | null;
  private auctionDoc: string;
  private guidelineDoc: string;
  private deadline: Date;
  private state: RFQState;
  private createdAt: Date;
  private createdBy: string;

  constructor(
    private readonly rfqRepository: RFQRepository,
    private readonly userRepository: UserRepository,
    private readonly bidRepository: BidRepository,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async closeExpiredRFQs() {
    const now = new Date();

    const expiredRFQs = await this.rfqRepository.findExpiredRFQs(now);

    if (expiredRFQs.length > 0) {
      for (const rfq of expiredRFQs) {
        await this.rfqRepository.updateRFQStatus(rfq.id, RFQState.CLOSED);

        if (rfq.bids && rfq.bids.length > 0) {
          for (const bid of rfq.bids) {
            await this.bidRepository.updateBidStatus(bid.id, BidState.CLOSED);
          }
        }
      }
    }
  }

  private async generateUniqueRFQId(): Promise<string> {
    let rfqId: string;

    while (true) {
      rfqId = uuidv4();
      const existingRFQ = await this.rfqRepository
        .getRFQById(rfqId)
        .catch(() => null); // Null if not found
      if (!existingRFQ) {
        return rfqId; // Unique ID found
      }
    }
  }
  /**
   * Creates a new RFQ with mandatory auctionDoc and guidelineDoc files
   */
  public async createRFQ(
    buyerId: string,
    rfqDto: CreateRFQDTO,
    files: {
      auctionDoc?: Express.Multer.File[];
      guidelineDoc?: Express.Multer.File[];
    },
  ): Promise<RFQ> {
    const user = await this.userRepository.findById(buyerId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { purchaseNumber } = rfqDto;
    const checkDuplicate = await this.rfqRepository.getRFQByPurchaseNumber(
      purchaseNumber,
      buyerId,
    );
    if (checkDuplicate) {
      throw new ConflictException('Purchase number already exists');
    }
    // Extract files from arrays and ensure they exist
    const auctionDocFile = files?.auctionDoc?.[0];
    const guidelineDocFile = files?.guidelineDoc?.[0];

    if (!auctionDocFile || !guidelineDocFile) {
      throw new BadRequestException(
        'Both auctionDoc and guidelineDoc files are required',
      );
    }

    const rfqId = await this.generateUniqueRFQId();
    const [auctionDocPath, guidelineDocPath] = await Promise.all([
      this.handleFileUpload(auctionDocFile, rfqId, 'auctionDoc'),
      this.handleFileUpload(guidelineDocFile, rfqId, 'guidelineDoc'),
    ]);

    try {
      const rfq = await this.rfqRepository.createRFQ(
        rfqDto,
        auctionDocPath,
        guidelineDocPath,

        user,
        rfqId,
      );
      this.syncWithRFQ(rfq);
      return rfq;
    } catch (error) {
      await Promise.all([
        this.cleanupFile(auctionDocPath),
        this.cleanupFile(guidelineDocPath),
      ]);
      throw new InternalServerErrorException('Failed to create RFQ');
    }
  }

  /**
   * Downloads a specific RFQ file (auctionDoc or guidelineDoc)
   */
  public async downloadFile(
    rfqId: string,
    filename: string,
    res: Response,
  ): Promise<void> {
    const safeRfqId = rfqId.replace(/[^a-zA-Z0-9-]/g, '');
    if (!safeRfqId) {
      throw new BadRequestException('Invalid rfqId provided');
    }

    const filePath = path.join(
      process.cwd(),
      'src/secured-storage/rfq',
      safeRfqId,
      filename,
    );
    console.log(filePath);

    try {
      await fs.access(filePath);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
      res.setHeader('Content-Type', 'application/octet-stream');
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(500).end();
        }
      });
    } catch (error) {
      throw new BadRequestException('File not found or inaccessible');
    }
  }

  /**
   * Retrieves an RFQ by ID
   */
  public async viewRFQ(id: string): Promise<RFQ> {
    const rfq = await this.rfqRepository.getRFQById(id);
    if (!rfq) {
      throw new NotFoundException('RFQ not found');
    }
    this.syncWithRFQ(rfq);
    return rfq;
  }

  /**
   * Updates an existing RFQ with optional file replacement
   */
  public async editRFQ(
    id: string,
    rfqDto: UpdateRFQDTO & {
      auctionDoc?: string | File;
      guidelineDoc?: string | File;
    }, // Extend DTO to include file fields
    auctionDocFile?: Express.Multer.File, // Optional new file upload
    guidelineDocFile?: Express.Multer.File, // Optional new file upload
  ): Promise<RFQ> {
    const existingRFQ = await this.viewRFQ(id);
    if (existingRFQ.state !== RFQState.OPENED) {
      throw new BadRequestException('RFQ can not be edited now');
    }

    let newAuctionDocPath: string | undefined;
    let newGuidelineDocPath: string | undefined;

    // Handle auctionDoc
    if (auctionDocFile) {
      // New file uploaded
      await this.cleanupFile(
        path.resolve(
          __dirname,
          '../../../../../src/secured-storage',
          existingRFQ.auctionDoc,
        ),
      );
      newAuctionDocPath = await this.handleFileUpload(
        auctionDocFile,
        id,
        'auctionDoc',
      );
    } else if (rfqDto.auctionDoc && typeof rfqDto.auctionDoc === 'string') {
      // Use string URL from DTO if provided
      newAuctionDocPath = rfqDto.auctionDoc;
    }

    // Handle guidelineDoc
    if (guidelineDocFile) {
      // New file uploaded
      await this.cleanupFile(
        path.resolve(
          __dirname,
          '../../../../../src/secured-storage',
          existingRFQ.guidelineDoc,
        ),
      );
      newGuidelineDocPath = await this.handleFileUpload(
        guidelineDocFile,
        id,
        'guidelineDoc',
      );
    } else if (rfqDto.guidelineDoc && typeof rfqDto.guidelineDoc === 'string') {
      // Use string URL from DTO if provided
      newGuidelineDocPath = rfqDto.guidelineDoc;
    }

    // Enforce mandatory fields if desired
    if (!newAuctionDocPath && !existingRFQ.auctionDoc) {
      throw new BadRequestException('Auction document is required');
    }
    if (!newGuidelineDocPath && !existingRFQ.guidelineDoc) {
      throw new BadRequestException('Guideline document is required');
    }

    try {
      const updatedRFQ = await this.rfqRepository.updateRFQ(
        id,
        rfqDto,
        newAuctionDocPath || existingRFQ.auctionDoc,
        newGuidelineDocPath || existingRFQ.guidelineDoc,
      );
      this.syncWithRFQ(updatedRFQ);
      return updatedRFQ;
    } catch (error) {
      if (newAuctionDocPath && newAuctionDocPath !== existingRFQ.auctionDoc) {
        await this.cleanupFile(newAuctionDocPath);
      }
      if (
        newGuidelineDocPath &&
        newGuidelineDocPath !== existingRFQ.guidelineDoc
      ) {
        await this.cleanupFile(newGuidelineDocPath);
      }
      throw new InternalServerErrorException('Failed to update RFQ');
    }
  }

  /**
   * Opens an RFQ
   */
  async deleteRFQ(id: string): Promise<RFQ> {
    return this.rfqRepository.deleteRFQ(id);
  }

  /**
   * Retrieves all RFQs for a buyer
   */
  public async findAllRFQs(buyerId: string): Promise<RFQ[]> {
    return this.rfqRepository.findAllRFQs(buyerId);
  }

  /**
   * Retrieves all RFQs for a seller
   */
  public async findAllRFQsSeller(sellerId: string): Promise<RFQ[]> {
    return this.rfqRepository.findAllRFQsSeller(sellerId);
  }

  /**
   * Handles file upload logic for auctionDoc or guidelineDoc
   */
  private async handleFileUpload(
    file: Express.Multer.File,
    rfqId: string,
    type: 'auctionDoc' | 'guidelineDoc',
  ): Promise<string> {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      throw new BadRequestException(`${type} file size must not exceed 10MB`);
    }

    const allowedTypes = [
      '.jpg',
      '.jpeg',
      '.png',
      '.pdf',
      '.docx',
      '.doc',
      '.xlsx',
      '.xls',
    ];
    const ext = extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(ext)) {
      throw new BadRequestException(
        `Invalid ${type} file type. Allowed types are: jpg, jpeg, png, pdf, docx, doc, xlsx, xls`,
      );
    }

    // Sanitize rfqId to prevent directory traversal
    const safeRfqId = rfqId.replace(/[^a-zA-Z0-9-]/g, '');
    if (!safeRfqId) {
      throw new BadRequestException('Invalid rfqId provided');
    }

    // Use absolute path from project root for consistency
    const storagePath = path.join(
      process.cwd(), // Current working directory (project root)
      'src/secured-storage/rfq',
      safeRfqId,
    );

    try {
      await fs.mkdir(storagePath, { recursive: true });
      const uniqueSuffix = uuidv4().slice(0, 8);
      const fileName = `${type}-${uniqueSuffix}${ext}`;
      const filePath = path.join(storagePath, fileName);

      // Check if file exists (optional, rare case due to UUID)
      try {
        await fs.access(filePath);
        throw new InternalServerErrorException(
          `File ${fileName} already exists`,
        );
      } catch (error) {
        if (error.code !== 'ENOENT') throw error; // Only proceed if file doesn't exist
      }

      await fs.writeFile(filePath, file.buffer);
      return `/rfq/${safeRfqId}/${fileName}`;
    } catch (error) {
      console.error(`Error saving ${type} file:`, error);
      // Cleanup directory if write fails (optional)
      try {
        await fs.rm(storagePath, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error(`Failed to clean up ${storagePath}:`, cleanupError);
      }
      throw new InternalServerErrorException(`Failed to save ${type} file`);
    }
  }
  /**
   * Cleans up a file from the filesystem
   */
  private async cleanupFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  /**
   * Generates the next purchase number for a specific user
   */
  async generatePurchaseNumber(userId: string): Promise<string> {
    return this.rfqRepository.generateNextPurchaseNumber(userId);
  }

  /**
   * Syncs private attributes with an RFQ entity
   */
  private syncWithRFQ(rfq: RFQ): void {
    this.id = rfq.id;
    this.title = rfq.title;
    this.projectName = rfq.projectName;
    this.purchaseNumber = rfq.purchaseNumber;
    this.quantity = rfq.quantity;
    this.category = rfq.category as Category;
    this.detail = rfq.detail || null;
    this.auctionDoc = rfq.auctionDoc;
    this.guidelineDoc = rfq.guidelineDoc;
    this.deadline = rfq.deadline;
    this.state = rfq.state;
    this.createdAt = rfq.createdAt;
    this.createdBy = rfq.createdBy?.id || ''; // Assuming buyer is an object with id
  }
}
