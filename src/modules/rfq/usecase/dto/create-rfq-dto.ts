import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsPositive,
  IsEmpty,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Category } from '../../utility/enums/category.enum';

export class createRFQDTO {
  @IsString({ message: 'Product name must be a string.' })
  productName: string;

  // Updated validation to allow float values
  @IsPositive({ message: 'Quantity must be a positive number.' })
  @Transform(({ value }) => parseFloat(value)) // Ensure it's treated as a float
  quantity: number;

  @IsString({ message: 'Category must be a string.' })
  @IsNotEmpty({ message: 'Category should not be empty.' })
  @IsEnum(Category, {
    message: 'Category must be a valid category from the predefined options.',
  })
  category: string;

  @IsString({ message: 'Detail must be a string.' })
  @IsOptional()
  detail: string;

  // File is sent as part of multipart/form-data and should be treated as optional.
  @IsOptional()
  file?: string;

  @IsDateString()
  @IsOptional()
  deadline: Date;
}
