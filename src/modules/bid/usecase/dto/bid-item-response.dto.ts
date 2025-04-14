import { Expose } from 'class-transformer';

export class BidItemResponse {
  @Expose()
  id: string;

  @Expose()
  item: string;

  @Expose()
  quantity: number;

  @Expose()
  unit: string;

  @Expose()
  singlePrice: number;

  @Expose()
  transportFee: number;

  @Expose()
  taxes: number;

  @Expose()
  totalPrice: number;
}
