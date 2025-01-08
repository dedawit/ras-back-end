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

  async viewRFQ(id: string): Promise<RFQ> {
    const rfq = await this.rfqRepository.getRFQById(id);
    if (!rfq) {
      throw new NotFoundException('RFQ not found');
    }
    return rfq;
  }

  async editRFQ(
    id: string,
    buyerId: string,
    rfqDto: UpdateRFQDTO,
  ): Promise<RFQ> {
    const existingRFQ = await this.rfqRepository.getRFQById(id);
    const user = await this.userRepository.findById(buyerId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!existingRFQ) {
      throw new NotFoundException('RFQ not found');
    }
    // if (existingRFQ.user.id !== user.id) {
    //   throw new ForbiddenException('Only the creator of the RFQ can edit it');
    // }
    return this.rfqRepository.updateRFQ(rfqDto);
  }

  async openRFQ(rfqId: string, buyerId: string): Promise<RFQ> {
    const rfq = await this.rfqRepository.getRFQById(rfqId);
    const user = await this.userRepository.findById(buyerId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.lastRole !== Role.BUYER) {
      throw new ForbiddenException('Only buyers can Open RFQs');
    }
    if (!rfq) {
      throw new NotFoundException('RFQ not found');
    }
    // if (rfq.user.id !== user.id) {
    //   throw new ForbiddenException('Only the creator of the RFQ can update it');
    // }
    rfq.state = true;
    return this.rfqRepository.updateRFQ(rfq);
  }

  async closeRFQ(rfqId: string, buyerId: string): Promise<RFQ> {
    const rfq = await this.rfqRepository.getRFQById(rfqId);
    const user = await this.userRepository.findById(buyerId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.lastRole !== Role.BUYER) {
      throw new ForbiddenException('Only buyers can close RFQs');
    }
    if (!rfq) {
      throw new NotFoundException('RFQ not found');
    }
    // if (rfq.user.id !== user.id) {
    //   throw new ForbiddenException('Only the creator of the RFQ can close it');
    // }
    rfq.state = false;

    return this.rfqRepository.updateRFQ(rfq);
  }

  //find all RFQs by id
  async findAllRFQs(buyerId: string): Promise<RFQ[]> {
    return this.rfqRepository.findAllRFQs(buyerId);
  }
}
