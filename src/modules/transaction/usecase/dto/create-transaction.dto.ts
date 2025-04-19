import {
  IsString,
  IsNotEmpty,
  IsPositive,
  IsArray,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @IsString({ message: 'Transaction ID must be a string.' })
  transactionId: string;

  @IsString({ message: 'Bid ID must be a string.' })
  @IsUUID()
  bidId: string;
}
