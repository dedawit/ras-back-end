import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { RFQ } from './rfq.entity';
import { CreateRFQDTO } from '../usecase/dto/create-rfq-dto';
import { UpdateRFQDTO } from '../usecase/dto/update-rfq-dto';
import { User } from 'src/modules/user/persistence/user.entity'; // Adjust import path
import { RFQState } from '../utility/enums/rfq-state.enum'; // Adjust import path

@Injectable()
export class RFQRepository {
  constructor(
    @InjectRepository(RFQ)
    private readonly rfqRepository: Repository<RFQ>,
  ) {}

  /**
   * Creates a new RFQ
   */
  async createRFQ(
    rfqDto: CreateRFQDTO,
    auctionDoc: string,
    guidelineDoc: string,
    createdBy: User,
    rfqId?: string,
  ): Promise<RFQ> {
    const rfq = this.rfqRepository.create({
      id: rfqId,
      ...rfqDto,
      auctionDoc,
      guidelineDoc,
      createdBy,
      createdAt: new Date(),
    });

    return this.rfqRepository.save(rfq);
  }

  /**
   * Retrieves an RFQ by ID
   */
  async getRFQById(id: string): Promise<RFQ> {
    console.log('id', id);
    const rfq = await this.rfqRepository.findOne({
      where: { id },
      relations: ['createdBy'], // Load buyer relation if needed
    });
    if (!rfq) {
      throw new NotFoundException(`RFQ with ID ${id} not found`);
    }
    return rfq;
  }

  /**
   * Retrieves an RFQ by purchaseNumber
   */
  async getRFQByPurchaseNumber(purchaseNumber: string): Promise<RFQ> {
    const rfq = await this.rfqRepository.findOne({
      where: { purchaseNumber },
      relations: ['createdBy'], // Load buyer relation if needed
    });

    return rfq;
  }

  /**
   * Updates an existing RFQ
   */
  async updateRFQ(
    id: string,
    rfqDto: UpdateRFQDTO,
    auctionDoc: string,
    guidelineDoc: string,
  ): Promise<RFQ> {
    const existingRFQ = await this.getRFQById(id); // Reuses getRFQById for consistency
    this.rfqRepository.merge(existingRFQ, {
      ...rfqDto,
      auctionDoc,
      guidelineDoc,
    }); // Merges DTO into entity
    return this.rfqRepository.save(existingRFQ);
  }

  /**
   * Finds all RFQs for a buyer
   */
  async findAllRFQs(createdBy: string): Promise<RFQ[]> {
    return this.rfqRepository.find({
      where: { createdBy: { id: createdBy } },
      relations: ['createdBy'],
    });
  }

  /**
   * Finds all RFQs not owned by a seller (for sellers to view)
   */
  async findAllRFQsSeller(sellerId: string): Promise<RFQ[]> {
    return this.rfqRepository.find({
      where: {
        createdBy: { id: Not(sellerId) },
      },
      relations: ['createdBy'], // Optional: include if buyer details are needed
    });
  }

  /**
   * Deletes an RFQ
   */
  async deleteRFQ(id: string): Promise<RFQ> {
    const rfq = await this.getRFQById(id);
    rfq.deletedAt = new Date();
    return this.rfqRepository.save(rfq);
  }
}
