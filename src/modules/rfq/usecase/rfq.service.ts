import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { RFQRepository } from '../persistence/rfq.repository';
import { createRFQDTO } from '../usecase/dto/create-rfq-dto';
import { UpdateRFQDTO } from '../usecase/dto/update-rfq-dto';
import { RFQ } from '../persistence/rfq.entity';
import { UserRepository } from 'src/modules/user/persistence/user.repository';
import { Role } from 'src/modules/user/utility/enums/role.enum';
import * as path from 'path';
import * as fs from 'fs';
import { Multer } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { Response } from 'express';

@Injectable()
export class RFQService {
  constructor(
    private readonly rfqRepository: RFQRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async createRFQ(
    buyerId: string,
    rfqDto: createRFQDTO,
    file: Multer.File,
  ): Promise<RFQ> {
    const user = await this.userRepository.findById(buyerId);
    // If a file is provided, validate the file
    if (file) {
      // File size validation (Max 10MB)
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_SIZE) {
        throw new BadRequestException('File size must not exceed 10MB');
      }

      // File type validation
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
        // Define the secure storage path
        const rfqId = uuidv4();
        const storagePath = path.resolve(
          __dirname,
          './../../../../../src/',
          'secured-storage',
          'rfq',
          rfqId,
        );

        // Ensure the directory exists
        await fs.promises.mkdir(storagePath, { recursive: true });

        // Save the file to the secure storage folder
        const filePath = path.join(storagePath, file.originalname);
        await fs.promises.writeFile(filePath, file.buffer);

        // Save the RFQ in the database with the file path
        const rfq = await this.rfqRepository.createRFQ(
          {
            ...rfqDto,
            file: `/rfq/${rfqId}/${file.originalname}`,
          },
          user,
          rfqId,
        );

        return rfq;
      } catch (error) {
        console.error('Error saving file:', error);
        throw new InternalServerErrorException('Failed to save file');
      }
    } else {
      // If no file is provided, just create the RFQ without the file path
      const rfq = await this.rfqRepository.createRFQ(
        {
          ...rfqDto,
        },
        user,
      );

      return rfq;
    }
  }

  // a method to download RFQ files
  async downloadFile(
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

  async viewRFQ(id: string): Promise<RFQ> {
    const rfq = await this.rfqRepository.getRFQById(id);
    if (!rfq) {
      throw new NotFoundException('RFQ not found');
    }
    return rfq;
  }

  async editRFQ(
    id: string,
    rfqDto: UpdateRFQDTO,
    file?: Multer.File, // Make file optional
  ): Promise<RFQ> {
    const existingRFQ = await this.viewRFQ(id);
    if (!existingRFQ) {
      throw new NotFoundException('RFQ not found');
    }

    // Handle file updates
    if (file != undefined) {
      // Explicit check for undefined to distinguish from no-file case
      // If there was a previous file, remove it
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
          // Continue even if deletion fails (file might have been manually removed)
        }
      }

      // If a new file is provided, process and store it
      if (file) {
        // File size validation (Max 10MB)
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX_SIZE) {
          throw new BadRequestException('File size must not exceed 10MB');
        }

        // File type validation
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
          // Use existing RFQ ID for storage path
          const storagePath = path.resolve(
            __dirname,
            './../../../../../src/',
            'secured-storage',
            'rfq',
            id,
          );

          // Ensure the directory exists
          await fs.promises.mkdir(storagePath, { recursive: true });

          // Save the new file
          const filePath = path.join(storagePath, file.originalname);
          await fs.promises.writeFile(filePath, file.buffer);

          // Update rfqDto with new file path
          rfqDto.file = `/rfq/${id}/${file.originalname}`;
        } catch (error) {
          console.error('Error saving file:', error);
          throw new InternalServerErrorException('Failed to save file');
        }
      } else {
        // If file is explicitly null, clear the file path
        rfqDto.file = null;
        console.log('is null');
      }
    }
    // If file parameter wasn't provided, existing file remains unchanged

    // Update the RFQ in the database
    return this.rfqRepository.updateRFQ(id, rfqDto);
  }

  async openRFQ(rfqId: string): Promise<RFQ> {
    return this.rfqRepository.openRFQ(rfqId);
  }

  async closeRFQ(rfqId: string): Promise<RFQ> {
    return this.rfqRepository.closeRFQ(rfqId);
  }

  //find all RFQs by id
  async findAllRFQs(buyerId: string): Promise<RFQ[]> {
    return this.rfqRepository.findAllRFQs(buyerId);
  }
}
