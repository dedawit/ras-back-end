import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { RFQRepository } from '../persistence/rfq.repository';
import { createRFQDTO } from '../usecase/dto/create-rfq-dto';
import { UpdateRFQDTO } from '../usecase/dto/update-rfq-dto';
import { RFQ } from '../persistence/rfq.entity';

@Injectable()
export class RFQService {
  constructor(private readonly rfqRepository: RFQRepository) {}

  async createRFQ(rfqDto: createRFQDTO): Promise<RFQ> {
    const { productName, quantity, category, detail, state, file, deadline } = rfqDto;

    
    const existingProduct = await this.rfqRepository.findProductByName(productName);
    if (existingProduct) {
      throw new ConflictException('Product with the same name already exists');
    }

   
    return this.rfqRepository.createRFQ(rfqDto);
  }

  async viewRFQ(id: number): Promise<RFQ> {
    const rfq = await this.rfqRepository.getRFQById(id);
    if (!rfq) {
      throw new NotFoundException('RFQ not found');
    }
    return rfq;
  }

  async editRFQ(id: number, rfqDto: UpdateRFQDTO): Promise<RFQ> {
    const existingRFQ = await this.rfqRepository.getRFQById(id);
    if (!existingRFQ) {
      throw new NotFoundException('RFQ not found');
    }
    return this.rfqRepository.updateRFQ(rfqDto);
  }

  async openRFQ(id: number): Promise<RFQ> {
    const rfq = await this.rfqRepository.getRFQById(id);
    if (!rfq) {
      throw new NotFoundException('RFQ not found');
    }
    rfq.state = true; 
    return this.rfqRepository.updateRFQ(rfq);
  }

  async closeRFQ(id: number): Promise<RFQ> {
    const rfq = await this.rfqRepository.getRFQById(id);
    if (!rfq) {
      throw new NotFoundException('RFQ not found');
    }
    rfq.state = false; 
    return this.rfqRepository.updateRFQ(rfq);
  }
}
