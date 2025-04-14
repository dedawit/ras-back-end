import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from './bid.entity'; // Adjust path
import { BidItem } from './bit-item.entity';
import { CreateBidItemDTO } from '../usecase/dto/create-bid-item.dto';

@Injectable()
export class BidItemRepository {
  constructor(
    @InjectRepository(BidItem)
    private readonly bidItemRepository: Repository<BidItem>,
  ) {}

  /**
   * Adds a new BidItem to a Bid
   */
  async addBidItem(bid: Bid, bidItemDto: CreateBidItemDTO): Promise<BidItem> {
    const bidItem = this.bidItemRepository.create({
      ...bidItemDto,
      bid,
    });
    return this.bidItemRepository.save(bidItem);
  }

  /**
   * Retrieves a BidItem by ID
   */
  async getBidItemById(id: string): Promise<BidItem> {
    const bidItem = await this.bidItemRepository.findOne({
      where: { id },
      relations: ['bid'],
    });
    if (!bidItem) {
      throw new NotFoundException(`BidItem with ID ${id} not found`);
    }
    return bidItem;
  }

  /**
   * Finds all BidItems for a specific Bid
   */
  async findBidItemsByBid(bidId: string): Promise<BidItem[]> {
    return this.bidItemRepository.find({
      where: { bid: { id: bidId } },
      relations: ['bid'],
    });
  }

  /**
   * Deletes a BidItem (soft delete if needed)
   */
  async deleteBidItem(id: string): Promise<BidItem> {
    const bidItem = await this.getBidItemById(id);
    return this.bidItemRepository.remove(bidItem); // Adjust for soft delete if required
  }
}
