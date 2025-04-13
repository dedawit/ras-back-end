import {
  IsString,
  IsNotEmpty,
  IsPositive,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateBidItemDTO } from './create-bid-item.dto'; // Adjust path if needed

export class CreateBidDTO {
  @IsString({ message: 'RFQ ID must be a string.' })
  rfqId: string;

  @Type(() => Number)
  @IsPositive({ message: 'Total price must be a positive number.' })
  totalPrice: number;

  @IsArray({ message: 'Bid items must be an array.' })
  @ValidateNested({ each: true })
  @Type(() => CreateBidItemDTO)
  bidItems: CreateBidItemDTO[];
}
