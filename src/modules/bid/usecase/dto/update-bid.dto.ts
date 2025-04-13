import {
  IsString,
  IsNotEmpty,
  IsPositive,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateBidItemDTO } from './create-bid-item.dto'; // Adjust path if needed

export class UpdateBidDTO {
  @IsString({ message: 'ID must be a string.' })
  @IsNotEmpty({ message: 'ID is required.' })
  id: string;

  @Type(() => Number)
  @IsPositive({ message: 'Total price must be a positive number.' })
  @IsNotEmpty({ message: 'Total price is required.' })
  totalPrice: number;

  // @IsArray({ message: 'Bid items must be an array.' })
  // @ValidateNested({ each: true })
  @Type(() => CreateBidItemDTO)
  @IsNotEmpty({ message: 'Bid items are required.' })
  bidItems: CreateBidItemDTO[];

  @IsOptional({ message: 'Bid files are required.' })
  bidFiles?: string | File;
}
