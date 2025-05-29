import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Like, Not, Raw, Repository } from 'typeorm';
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

  async updateRFQStatus(id: string, state: string): Promise<RFQ> {
    const rfq = await this.getRFQById(id);
    if (!rfq) {
      throw new NotFoundException(`RFQ with ID ${id} not found`);
    }

    const stateMap: Record<string, RFQState> = {
      opened: RFQState.OPENED,
      closed: RFQState.CLOSED,
      awarded: RFQState.AWARDED,
    };

    const newState = stateMap[state.toLowerCase()];
    if (!newState) {
      return null;
    }

    rfq.state = newState;
    await this.rfqRepository.save(rfq);
    return rfq;
  }

  async findExpiredRFQs(now: Date): Promise<RFQ[]> {
    const expiredRFQs = await this.rfqRepository.find({
      where: {
        deadline: LessThan(now),
        state: RFQState.OPENED,
      },
      relations: ['bids'],
    });
    return expiredRFQs;
  }

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
  async getRFQById(id: string): Promise<RFQ | null> {
    console.log('id', id);
    const rfq = await this.rfqRepository.findOne({
      where: { id },
      relations: ['bids', 'createdBy'],  
    });
    if (!rfq) {
      throw new NotFoundException(`RFQ with ID ${id} not found`);
    }
    return rfq;
  }

async getRfqHistoryByBuyer(buyerId: string): Promise<RFQ[]> {
  return this.rfqRepository.find({
    where: { createdBy: { id: buyerId } },
    relations: [
      'bids',
      'bids.transactions',
      'bids.transactions.payment',
      'bids.createdBy',
    ],
    order: {
      createdAt: 'DESC',
    },
  });
}
  /**
   * Retrieves an RFQ by purchaseNumber
   */
  async getRFQByPurchaseNumber(
    purchaseNumber: string,
    buyerId: string,
  ): Promise<RFQ> {
    const rfq = await this.rfqRepository.findOne({
      where: { purchaseNumber, createdBy: { id: buyerId } },
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

  /**
   * Generates the next purchase number in RFQ-000 format for a specific user
   */
  async generateNextPurchaseNumber(userId: string): Promise<string> {
    const latestRFQ = await this.rfqRepository.findOne({
      where: {
        purchaseNumber: Raw((alias) => `${alias} ~ '^RFQ-[0-9]+$'`),
        createdBy: { id: userId },
      },
      order: { purchaseNumber: 'DESC' },
    });

    let nextNumber = 1;
    if (latestRFQ && latestRFQ.purchaseNumber) {
      const match = latestRFQ.purchaseNumber.match(/^RFQ-(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    return `RFQ-${nextNumber.toString().padStart(3, '0')}`;
  }
}
