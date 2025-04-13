import { Expose, Type } from 'class-transformer';
import { BidItemResponse } from './bid-item-response.dto'; // Adjust path

export class BidResponse {
  @Expose()
  id: string;

  @Expose()
  rfqId: string;

  @Expose()
  createdBy: string;

  @Expose()
  files: string;

  @Expose()
  totalPrice: number;

  @Expose()
  @Type(() => BidItemResponse)
  bidItems: BidItemResponse[];

  @Expose()
  createdAt: Date;
}
