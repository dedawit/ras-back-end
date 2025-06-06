import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { BidItemRepository } from '../persistence/bid-item.repository'; // Adjust path
import { BidRepository } from '../persistence/bid.repository'; // Adjust path

import { Bid } from '../persistence/bid.entity'; // Adjust path
import { v4 as uuidv4 } from 'uuid';
import { CreateBidItemDTO } from './dto/create-bid-item.dto';
import { BidItem } from '../persistence/bit-item.entity';

@Injectable()
export class BidItemService {
  private id: string;
  private item: string;
  private quantity: number;
  private unit: string;
  private singlePrice: number;
  private transportFee: number | null;
  private taxes: number | null;
  private totalPrice: number;
  private bid: string;

  constructor(
    private readonly bidItemRepository: BidItemRepository,

    @Inject(forwardRef(() => BidRepository))
    private readonly bidRepository: BidRepository,
  ) {}

  /**
   * Adds a new BidItem to an existing Bid
   */
  public async addBidItem(
    bidId: string,
    bidItemDto: CreateBidItemDTO,
  ): Promise<BidItem> {
    const bid = await this.bidRepository.getBidById(bidId);
    if (!bid) {
      throw new NotFoundException(`Bid with ID ${bidId} not found`);
    }

    // Validate bid item data
    this.validateBidItemDto(bidItemDto);

    try {
      const bidItem = await this.bidItemRepository.addBidItem(bid, bidItemDto);
      this.syncWithBidItem(bidItem);
      return bidItem;
    } catch (error) {
      throw new InternalServerErrorException('Failed to add bid item');
    }
  }

  /**
   * Retrieves a BidItem by ID
   */
  public async getBidItem(id: string): Promise<BidItem> {
    const bidItem = await this.bidItemRepository.getBidItemById(id);
    if (!bidItem) {
      throw new NotFoundException(`BidItem with ID ${id} not found`);
    }
    this.syncWithBidItem(bidItem);
    return bidItem;
  }

  /**
   * Retrieves all BidItems for a Bid
   */
  public async findAllBidItemsByBid(bidId: string): Promise<BidItem[]> {
    const bid = await this.bidRepository.getBidById(bidId);
    if (!bid) {
      throw new NotFoundException(`Bid with ID ${bidId} not found`);
    }
    const bidItems = await this.bidItemRepository.findBidItemsByBid(bidId);
    if (bidItems.length > 0) {
      this.syncWithBidItem(bidItems[0]); // Sync with the first item for consistency
    }
    return bidItems;
  }

  /**
   * Deletes a BidItem
   */
  public async deleteBidItem(id: string): Promise<BidItem> {
    const bidItem = await this.bidItemRepository.deleteBidItem(id);
    this.syncWithBidItem(bidItem); // Sync before returning
    return bidItem;
  }

  /**
   * Validates the CreateBidItemDTO
   */
  private validateBidItemDto(bidItemDto: CreateBidItemDTO): void {
    const { quantity, singlePrice, totalPrice, transportFee, taxes } =
      bidItemDto;

    // Ensure totalPrice aligns with calculation
    const calculatedTotal =
      quantity * singlePrice + (transportFee || 0) + (taxes || 0);
    if (totalPrice !== calculatedTotal) {
      throw new BadRequestException(
        `Total price (${totalPrice}) does not match calculated total (${calculatedTotal})`,
      );
    }
  }

  /**
   * Syncs private attributes with a BidItem entity
   */
  private syncWithBidItem(bidItem: BidItem): void {
    this.id = bidItem.id;
    this.item = bidItem.item;
    this.quantity = bidItem.quantity;
    this.unit = bidItem.unit;
    this.singlePrice = bidItem.singlePrice;
    this.transportFee = bidItem.transportFee || null;
    this.taxes = bidItem.taxes || null;
    this.totalPrice = bidItem.totalPrice;
    this.bid = bidItem.bid?.id || '';
  }
}
