import {
  IsString,
  IsNotEmpty,
  IsPositive,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBidItemDTO {
  @IsString({ message: 'Item must be a string.' })
  @IsNotEmpty({ message: 'Item is required.' })
  item: string;

  @Type(() => Number)
  @IsPositive({ message: 'Quantity must be a positive number.' })
  quantity: number;

  @IsString({ message: 'Unit must be a string.' })
  @IsNotEmpty({ message: 'Unit is required.' })
  unit: string;

  @Type(() => Number)
  @IsPositive({ message: 'Single price must be a positive number.' })
  singlePrice: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Transport fee must be a number.' })
  @IsOptional()
  transportFee?: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Taxes must be a number.' })
  @IsOptional()
  taxes?: number;

  @Type(() => Number)
  @IsPositive({ message: 'Total price must be a positive number.' })
  totalPrice: number;
}
