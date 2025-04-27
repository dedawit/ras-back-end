import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from './bid.entity'; // Adjust path if needed

import { User } from 'src/modules/user/persistence/user.entity'; // Adjust path
import { UpdateBidDTO } from '../usecase/dto/update-bid.dto';
import { BidState } from '../usecase/utility/bid-state.enum';

import { BidItem } from './bit-item.entity';
import { BidItemService } from '../usecase/bid-item.service';

@Injectable()
export class BidRepository {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    private readonly bidItemService: BidItemService,
  ) {}

  async updateBidStatus(bidId: string, status: string): Promise<Bid> {
    const bid = await this.getBidById(bidId);
    if (!bid) return null;

    const statusMap: Record<string, BidState> = {
      awarded: BidState.AWARDED,
      rejected: BidState.REJECTED,
      closed: BidState.CLOSED,
      opened: BidState.OPENED,
    };

    const newState = statusMap[status.toLowerCase()];
    if (!newState) return null;

    bid.state = newState;
    await this.bidRepository.save(bid);
    return bid;
  }

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
      relations: [
        'rfq',
        'createdBy',
        'bidItems',
        'rfq.createdBy',
        'transactions',
      ], // Load RFQ and user relations
    });
    if (!bid) {
      throw new NotFoundException(`Bid with ID ${id} not found`);
    }
    return bid;
  }

  async updateBid(
    id: string,
    bidDto: UpdateBidDTO,
    files: string,
  ): Promise<Bid> {
    const existingBid = await this.getBidById(id);

    // Step 1: Delete existing bid items
    const existingBidItems = existingBid.bidItems;
    for (const item of existingBidItems) {
      await this.bidItemService.deleteBidItem(item.id);
    }

    // Step 2: Add new bid items
    const newBidItems: BidItem[] = [];
    for (const bidItemDto of bidDto.bidItems) {
      const validatedItem = await this.bidItemService.addBidItem(
        id,
        bidItemDto,
      );
      newBidItems.push(validatedItem);
    }

    // Step 3: Use Object.assign to update existingBid with new values
    Object.assign(existingBid, {
      ...bidDto,
      bidItems: newBidItems,
      files,
    });

    // Step 4: Save the updated bid
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

  //reject other bids
  async rejectOtherBids(rfqId: string, awardedBidId: string): Promise<void> {
    await this.bidRepository
      .createQueryBuilder()
      .update()
      .set({ state: BidState.REJECTED })
      .where('rfqId = :rfqId', { rfqId })
      .andWhere('id != :awardedBidId', { awardedBidId })
      .andWhere('state != :awardedState', { awardedState: BidState.AWARDED })
      .execute();
  }
}
