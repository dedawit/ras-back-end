import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RFQ } from './rfq.entity';
import { createRFQDTO } from '../usecase/dto/create-rfq-dto';
import { UpdateRFQDTO } from '../usecase/dto/update-rfq-dto';
import { CreateUserDto } from 'src/modules/user/usecase/dto/create-user.dto';

@Injectable()
export class RFQRepository {
  constructor(
    @InjectRepository(RFQ)
    private readonly rfqRepository: Repository<RFQ>,
  ) {}

  async createRFQ(
    rfqDto: createRFQDTO,
    user: CreateUserDto, // Assuming user is the buyer here
    rfqId?: string,
  ): Promise<RFQ> {
    console.log(rfqDto);
    let rfq;

    // If rfqId exists, update the existing RFQ
    if (rfqId) {
      rfq = this.rfqRepository.create({
        id: rfqId,
        ...rfqDto,
        buyer: user, // Assigning the 'user' as buyer
        createdAt: new Date(),
      });
    } else {
      // Otherwise, create a new RFQ
      rfq = this.rfqRepository.create({
        ...rfqDto,
        buyer: user, // Assigning the 'user' as buyer
        createdAt: new Date(),
      });
    }

    return this.rfqRepository.save(rfq);
  }

  async getRFQById(id: string): Promise<RFQ> {
    return this.rfqRepository.findOne({ where: { id } });
  }
  async updateRFQ(id: string, rfqDto: UpdateRFQDTO): Promise<RFQ> {
    const existingRFQ = await this.rfqRepository.findOneOrFail({
      where: { id },
    });
    if (!existingRFQ) {
      throw new NotFoundException(`RFQ not found`);
    }

    const updatedRFQ = Object.assign(existingRFQ, rfqDto);

    return this.rfqRepository.save(updatedRFQ);
  }

  async findProductByName(productName: string): Promise<RFQ> {
    return this.rfqRepository.findOne({ where: { productName } });
  }

  //find all rfqs
  async findAllRFQs(buyerId: string): Promise<RFQ[]> {
    return this.rfqRepository.find({ where: { buyer: { id: buyerId } } });
  }

  async openRFQ(id: string): Promise<RFQ> {
    const existingRFQ = await this.rfqRepository.findOneOrFail({
      where: { id },
    });
    if (!existingRFQ) {
      throw new NotFoundException(`RFQ not found`);
    }
    const updatedRFQ = Object.assign({}, existingRFQ, { state: true });
    return await this.rfqRepository.save(updatedRFQ);
  }

  async closeRFQ(id: string): Promise<RFQ> {
    const existingRFQ = await this.rfqRepository.findOneOrFail({
      where: { id },
    });
    if (!existingRFQ) {
      throw new NotFoundException(`RFQ not found`);
    }
    const updatedRFQ = Object.assign({}, existingRFQ, { state: false });
    return await this.rfqRepository.save(updatedRFQ);
  }
}
