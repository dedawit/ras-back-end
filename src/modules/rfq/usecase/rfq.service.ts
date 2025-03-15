import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { RFQRepository } from '../persistence/rfq.repository';
import { createRFQDTO } from '../usecase/dto/create-rfq-dto';
import { UpdateRFQDTO } from '../usecase/dto/update-rfq-dto';
import { RFQ } from '../persistence/rfq.entity';
import { UserRepository } from 'src/modules/user/persistence/user.repository';
import { Multer } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { Response } from 'express';

@Injectable()
export class RFQService {
  private id: string;
  private productName: string;
  private quantity: number;
  private category: string;
  private detail: string | null;
  private state: boolean;
  private file: string | null;
  private deadline: Date | null;
  private createdAt: Date;
  private buyerId: string;

  constructor(
    private readonly rfqRepository: RFQRepository,
    private readonly userRepository: UserRepository,
  ) {}

  public async createRFQ(
    buyerId: string,
    rfqDto: createRFQDTO,
    file?: Multer.File,
  ): Promise<RFQ> {
    const user = await this.userRepository.findById(buyerId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let rfq: RFQ;
    if (file) {
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_SIZE) {
        throw new BadRequestException('File size must not exceed 10MB');
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
          'Invalid file type. Allowed types are: jpg, jpeg, png, pdf, docx, doc, xlsx, xls',
        );
      }

      try {
        const rfqId = uuidv4();
        const storagePath = path.resolve(
          __dirname,
          './../../../../../src/',
          'secured-storage',
          'rfq',
          rfqId,
        );

        await fs.promises.mkdir(storagePath, { recursive: true });
        const filePath = path.join(storagePath, file.originalname);
        await fs.promises.writeFile(filePath, file.buffer);

        rfq = await this.rfqRepository.createRFQ(
          {
            ...rfqDto,
            file: `/rfq/${rfqId}/${file.originalname}`,
          },
          user,
          rfqId,
        );
      } catch (error) {
        console.error('Error saving file:', error);
        throw new InternalServerErrorException('Failed to save file');
      }
    } else {
      rfq = await this.rfqRepository.createRFQ(
        {
          ...rfqDto,
        },
        user,
      );
    }

    this.syncWithRFQ(rfq);
    return rfq;
  }

  public async downloadFile(
    rfqId: string,
    filename: string,
    res: Response,
  ): Promise<void> {
    try {
      const filePath = path.resolve(
        __dirname,
        './../../../../../src/',
        'secured-storage',
        'rfq',
        rfqId,
        filename,
      );

      await fs.promises.access(filePath);

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

  public async viewRFQ(id: string): Promise<RFQ> {
    const rfq = await this.rfqRepository.getRFQById(id);
    if (!rfq) {
      throw new NotFoundException('RFQ not found');
    }
    this.syncWithRFQ(rfq);
    return rfq;
  }

  public async editRFQ(
    id: string,
    rfqDto: UpdateRFQDTO,
    file?: Multer.File,
  ): Promise<RFQ> {
    const existingRFQ = await this.viewRFQ(id);

    if (file !== undefined) {
      if (existingRFQ.file) {
        const oldFilePath = path.resolve(
          __dirname,
          './../../../../../src/',
          'secured-storage',
          existingRFQ.file,
        );
        try {
          await fs.promises.unlink(oldFilePath);
        } catch (error) {
          console.error('Error deleting old file:', error);
        }
      }

      if (file) {
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX_SIZE) {
          throw new BadRequestException('File size must not exceed 10MB');
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
            'Invalid file type. Allowed types are: jpg, jpeg, png, pdf, docx, doc, xlsx, xls',
          );
        }

        try {
          const storagePath = path.resolve(
            __dirname,
            './../../../../../src/',
            'secured-storage',
            'rfq',
            id,
          );

          await fs.promises.mkdir(storagePath, { recursive: true });
          const filePath = path.join(storagePath, file.originalname);
          await fs.promises.writeFile(filePath, file.buffer);

          rfqDto.file = `/rfq/${id}/${file.originalname}`;
        } catch (error) {
          console.error('Error saving file:', error);
          throw new InternalServerErrorException('Failed to save file');
        }
      } else {
        rfqDto.file = null;
      }
    }

    const updatedRFQ = await this.rfqRepository.updateRFQ(id, rfqDto);
    this.syncWithRFQ(updatedRFQ);
    return updatedRFQ;
  }

  public async openRFQ(rfqId: string): Promise<RFQ> {
    const rfq = await this.rfqRepository.openRFQ(rfqId);
    this.syncWithRFQ(rfq);
    return rfq;
  }

  public async closeRFQ(rfqId: string): Promise<RFQ> {
    const rfq = await this.rfqRepository.closeRFQ(rfqId);
    this.syncWithRFQ(rfq);
    return rfq;
  }

  public async findAllRFQs(buyerId: string): Promise<RFQ[]> {
    return this.rfqRepository.findAllRFQs(buyerId);
  }

  //find all rfqs for seller
  async findAllRFQsSeller(sellerId: string): Promise<RFQ[]> {
    return this.rfqRepository.findAllRFQsSeller(sellerId);
  }

  public syncWithRFQ(rfq: RFQ): void {
    this.id = rfq.id;
    this.productName = rfq.productName;
    this.quantity = rfq.quantity;
    this.category = rfq.category;
    this.detail = rfq.detail;
    this.state = rfq.state;
    this.file = rfq.file;
    this.deadline = rfq.deadline;
    this.createdAt = rfq.createdAt;
    // this.buyerId = rfq.buyer.id;
  }
}
