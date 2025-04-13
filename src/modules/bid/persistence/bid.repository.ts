import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from './bid.entity'; // Adjust path if needed

import { User } from 'src/modules/user/persistence/user.entity'; // Adjust path
import { UpdateBidDTO } from '../usecase/dto/update-bid.dto';

@Injectable()
export class BidRepository {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
  ) {}

  /**
   * Creates a new Bid
   */
  async createBid(
    files: string,
    rfqId: string,
    totalPrice: number,
    createdBy: string,
    id: string,
  ): Promise<Bid> {
    const bid = this.bidRepository.create({
      id,
      rfq: { id: rfqId },
      totalPrice,
      createdBy: { id: createdBy },
      files,
      createdAt: new Date(),
    });

    return this.bidRepository.save(bid);
  }

  /**
   * Retrieves a Bid by ID
   */
  async getBidById(id: string): Promise<Bid> {
    const bid = await this.bidRepository.findOne({
      where: { id },
      relations: ['rfq', 'createdBy', 'bidItems'], // Load RFQ and user relations
    });
    if (!bid) {
      throw new NotFoundException(`Bid with ID ${id} not found`);
    }
    return bid;
  }

  /**
   * Updates an existing Bid
   */
  async updateBid(
    id: string,
    bidDto: UpdateBidDTO,
    files: string,
  ): Promise<Bid> {
    const existingBid = await this.getBidById(id); // Reuses viewBid for consistency
    this.bidRepository.merge(existingBid, {
      ...bidDto,
      files,
    }); // Merges DTO into entity
    return this.bidRepository.save(existingBid);
  }
  /**
   * Finds all Bids for a specific RFQ
   */
  async findBidsByRFQ(rfqId: string): Promise<Bid[]> {
    return this.bidRepository.find({
      where: { rfq: { id: rfqId } },
      relations: ['rfq', 'createdBy'],
    });
  }

  /**
   * Finds all Bids created by a user
   */
  async findBidsByUser(createdById: string): Promise<Bid[]> {
    return this.bidRepository.find({
      where: { createdBy: { id: createdById } },
      relations: ['rfq', 'createdBy', 'bidItems'],
    });
  }

  /**
   * Deletes a Bid (soft delete)
   */
  async deleteBid(id: string): Promise<Bid> {
    const bid = await this.getBidById(id);
    bid.deletedAt = new Date();
    return this.bidRepository.save(bid);
  }
}
