import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RFQ } from './rfq.entity';
import { createRFQDTO } from '../usecase/dto/create-rfq-dto';
import { UpdateRFQDTO } from '../usecase/dto/update-rfq-dto';

@Injectable()
export class RFQRepository {
  constructor(
    @InjectRepository(RFQ)
    private readonly rfqRepository: Repository<RFQ>,
  ) {}

  async createRFQ(rfqDto: createRFQDTO): Promise<RFQ> {
    const rfq = this.rfqRepository.create(rfqDto);
    return this.rfqRepository.save(rfq);
  }

  async getRFQById(id: number): Promise<RFQ> {
    return this.rfqRepository.findOne({ where: { id } });
  }

  async updateRFQ(rfqDto: UpdateRFQDTO): Promise<RFQ> {
    return this.rfqRepository.save(rfqDto);
  }
  async findProductByName(productName: string): Promise<RFQ> {
    return this.rfqRepository.findOne({ where: { productName } });
  }

 
}
