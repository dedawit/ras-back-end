import { Expose} from 'class-transformer';


export class RFQResponse {
  @Expose()
  id: number;

  @Expose()
  productName: string;

  @Expose()
  quantity: number;

  @Expose()
  category: string;

  @Expose()
  detail: string;

  @Expose()
  state: boolean;

  @Expose()
  file: string;

  @Expose()
  deadline: Date;
}
