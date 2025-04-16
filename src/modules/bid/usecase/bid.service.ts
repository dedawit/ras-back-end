import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { BidRepository } from '../persistence/bid.repository'; // Adjust path
import { BidItemService } from './bid-item.service'; // Adjust path
import { UserRepository } from 'src/modules/user/persistence/user.repository'; // Adjust path
import { Bid } from '../persistence/bid.entity'; // Adjust path
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { Response } from 'express';
import { RFQService } from 'src/modules/rfq/usecase/rfq.service';
import { UserService } from 'src/modules/user/usecase/user.service';
import { CreateBidDTO } from './dto/create-bid.dto';
import { UpdateBidDTO } from './dto/update-bid.dto';
import { BidState } from './utility/bid-state.enum';
import { RFQRepository } from 'src/modules/rfq/persistence/rfq.repository';
import { RFQState } from 'src/modules/rfq/utility/enums/rfq-state.enum';

@Injectable()
export class BidService {
  private id: string;
  private rfq: string; // Storing RFQ ID
  private createdBy: string; // Storing User ID
  private files: string | null;
  private totalPrice: number;
  private createdAt: Date;
  private deletedAt: Date | null;

  constructor(
    private readonly bidRepository: BidRepository,
    private readonly bidItemService: BidItemService,
    private readonly rfqService: RFQService,
    private readonly userService: UserService,
    private readonly rfqRepository: RFQRepository,
    
  ) {}

async awardBid(bidId: string): Promise<string> {
    const bid = await this.bidRepository.updateBidStatus(bidId, BidState.AWARDED);

    if (!bid) throw new NotFoundException('Bid not found or invalid');

    if (bid.rfq) {
      await this.rfqRepository.updateRFQStatus(bid.rfq.id, RFQState.AWARDED);
    }

    return 'Bid awarded and RFQ updated successfully.';
  }

  async rejectBid(bidId: string): Promise<string> {
    const bid = await this.bidRepository.updateBidStatus(bidId, BidState.REJECTED);

    if (!bid) throw new NotFoundException('Bid not found or invalid');

    return 'Bid rejected successfully.';
  }

  /**
   * Generates a unique bidId by checking the database
   */
  private async generateUniqueBidId(): Promise<string> {
    let bidId: string;

    while (true) {
      bidId = uuidv4();
      const existingBid = await this.bidRepository
        .getBidById(bidId)
        .catch(() => null);
      if (!existingBid) {
        return bidId; // Unique ID found
      }
    }
  }

  /**
   * Creates a new Bid with its BidItems and a mandatory zip file
   */
  public async createBid(
    userId: string,
    bidDto: CreateBidDTO,
    files: { bidFiles?: Express.Multer.File[] },
  ): Promise<Bid> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    console.log(bidDto.rfqId);
    const rfq = await this.rfqService.viewRFQ(bidDto.rfqId);
    if (!rfq) {
      throw new NotFoundException(`RFQ with ID ${bidDto.rfqId} not found`);
    }

    const bidFilesFile = files?.bidFiles?.[0];
    console.log(bidFilesFile);
    if (!bidFilesFile) {
      throw new BadRequestException('A zip file is required for the bid');
    }

    // Validate bid data
    this.validateBidDto(bidDto);

    const bidId = await this.generateUniqueBidId(); // Generate unique ID with DB check
    const filesPath = await this.handleFileUpload(
      bidFilesFile,
      bidId,
      'bidFiles',
    );

    try {
      const bid = await this.bidRepository.createBid(
        filesPath,
        rfq.id,
        bidDto.totalPrice,
        userId,
        bidId,
      );

      // Add bid items
      for (const bidItemDto of bidDto.bidItems) {
        await this.bidItemService.addBidItem(bid.id, bidItemDto);
      }

      const fullBid = await this.bidRepository.getBidById(bid.id); // Reload with relations
      this.syncWithBid(fullBid);
      return fullBid;
    } catch (error) {
      await this.cleanupFile(filesPath);
      throw new InternalServerErrorException('Failed to create bid');
    }
  }

  /**
   * Downloads the bid zip file
   */
  public async downloadBidFile(
    bidId: string,
    filename: string,
    res: Response,
  ): Promise<void> {
    const safeBidId = bidId.replace(/[^a-zA-Z0-9-]/g, '');
    if (!safeBidId) {
      throw new BadRequestException('Invalid bidId provided');
    }

    const filePath = path.join(
      process.cwd(),
      'src/secured-storage/bid',
      safeBidId,
      filename,
    );

    try {
      await fs.access(filePath);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
      res.setHeader('Content-Type', 'application/zip');
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
   * Retrieves a Bid by ID
   */
  public async getBid(id: string): Promise<Bid> {
    const bid = await this.bidRepository.getBidById(id);
    if (!bid) {
      throw new NotFoundException(`Bid with ID ${id} not found`);
    }
    this.syncWithBid(bid);
    return bid;
  }

  /**
   * Retrieves all Bids for an RFQ
   */
  public async findBidsByRFQ(rfqId: string): Promise<Bid[]> {
    const rfq = await this.rfqService.viewRFQ(rfqId);
    if (!rfq) {
      throw new NotFoundException(`RFQ with ID ${rfqId} not found`);
    }
    const bids = await this.bidRepository.findBidsByRFQ(rfqId);
    if (bids.length > 0) {
      this.syncWithBid(bids[0]); // Sync with the first bid
    }
    return bids;
  }

  /**
   * Retrieves all Bids created by a user
   */
  public async findBidsByUser(userId: string): Promise<Bid[]> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const bids = await this.bidRepository.findBidsByUser(userId);
    if (bids.length > 0) {
      this.syncWithBid(bids[0]); // Sync with the first bid
    }
    return bids;
  }

  /**
   * Deletes a Bid (soft delete)
   */
  public async deleteBid(id: string): Promise<Bid> {
    const bid = await this.bidRepository.deleteBid(id);
    this.syncWithBid(bid); // Sync before returning
    return bid;
  }

  /**
   * Validates the CreateBidDTO
   */
  private validateBidDto(bidDto: CreateBidDTO): void {
    const { totalPrice, bidItems } = bidDto;

    // Calculate total price from bid items
    const calculatedTotal = bidItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );
    if (totalPrice !== calculatedTotal) {
      throw new BadRequestException(
        `Total price (${totalPrice}) does not match sum of bid items (${calculatedTotal})`,
      );
    }
  }

  /**
   * Handles file upload logic for bidFiles (zip only)
   */
  private async handleFileUpload(
    file: Express.Multer.File,
    bidId: string,
    type: 'bidFiles',
  ): Promise<string> {
    // const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    // if (file.size > MAX_SIZE) {
    //   throw new BadRequestException(`${type} file size must not exceed 10MB`);
    // }

    const allowedType = '.zip';
    const ext = extname(file.originalname).toLowerCase();
    if (ext !== allowedType) {
      throw new BadRequestException(
        `Invalid ${type} file type. Only .zip files are allowed`,
      );
    }

    // Sanitize bidId to prevent directory traversal
    const safeBidId = bidId.replace(/[^a-zA-Z0-9-]/g, '');
    if (!safeBidId) {
      throw new BadRequestException('Invalid bidId provided');
    }

    // Use absolute path from project root for consistency
    const storagePath = path.join(
      process.cwd(),
      'src/secured-storage/bid',
      safeBidId,
    );

    try {
      await fs.mkdir(storagePath, { recursive: true });
      const uniqueSuffix = uuidv4().slice(0, 8);
      const fileName = `${type}-${uniqueSuffix}${ext}`;
      const filePath = path.join(storagePath, fileName);

      // Check if file exists (rare case due to prior DB check and UUID)
      try {
        await fs.access(filePath);
        throw new InternalServerErrorException(
          `File ${fileName} already exists`,
        );
      } catch (error) {
        if (error.code !== 'ENOENT') throw error; // Proceed if file doesn't exist
      }

      await fs.writeFile(filePath, file.buffer);
      return `/bid/${safeBidId}/${fileName}`;
    } catch (error) {
      console.error(`Error saving ${type} file:`, error);
      try {
        await fs.rm(storagePath, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error(`Failed to clean up ${storagePath}:`, cleanupError);
      }
      throw new InternalServerErrorException(`Failed to save ${type} file`);
    }
  }

  public async editBid(
    id: string,
    bidDto: UpdateBidDTO & { bidFiles?: string | File }, // Extend DTO to include file field
    files?: Express.Multer.File, // Optional new file upload
  ): Promise<Bid> {
    const existingBid = await this.bidRepository.getBidById(id);

    let newBidFilesPath: string | undefined;

    // Handle bidFiles
    if (files) {
      // New file uploaded
      await this.cleanupFile(
        path.resolve(
          __dirname,
          '../../../../../src/secured-storage',
          existingBid.files,
        ),
      );
      newBidFilesPath = await this.handleFileUpload(files, id, 'bidFiles');
    } else if (bidDto.bidFiles && typeof bidDto.bidFiles === 'string') {
      // Use string URL from DTO if provided
      newBidFilesPath = bidDto.bidFiles;
    }

    // Enforce mandatory field
    if (!newBidFilesPath && !existingBid.files) {
      throw new BadRequestException('Bid files are required');
    }

    try {
      const updatedBid = await this.bidRepository.updateBid(
        id,
        bidDto,
        newBidFilesPath || existingBid.files,
      );
      this.syncWithBid(updatedBid); // Assuming a sync method exists
      return updatedBid;
    } catch (error) {
      if (newBidFilesPath && newBidFilesPath !== existingBid.files) {
        await this.cleanupFile(newBidFilesPath);
      }
      throw new InternalServerErrorException('Failed to update bid');
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
   * Syncs private attributes with a Bid entity
   */
  private syncWithBid(bid: Bid): void {
    this.id = bid.id;
    this.rfq = bid.rfq?.id || ''; // Assuming rfq is an object with id
    this.createdBy = bid.createdBy?.id || ''; // Assuming createdBy is an object with id
    this.files = bid.files || null;
    this.totalPrice = bid.totalPrice;
    this.createdAt = bid.createdAt;
    this.deletedAt = bid.deletedAt || null;
  }
}
