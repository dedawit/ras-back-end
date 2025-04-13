import { Expose } from 'class-transformer';
import { Category } from '../../utility/enums/category.enum';
import { RFQState } from '../../utility/enums/rfq-state.enum';

export class RFQResponse {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  projectName: string;

  @Expose()
  purchaseNumber: string;

  @Expose()
  quantity: number;

  @Expose()
  category: Category;

  @Expose()
  detail: string;

  @Expose()
  auctionDoc: string;

  @Expose()
  guidelineDoc: string;

  @Expose()
  deadline: Date;

  @Expose()
  state: RFQState;

  @Expose()
  createdAt: Date;
}
