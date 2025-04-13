import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsPositive,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Category } from '../../utility/enums/category.enum';
import { RFQState } from '../../utility/enums/rfq-state.enum';
import { Type } from 'class-transformer';

export class CreateRFQDTO {
  @IsString({ message: 'Title must be a string.' })
  @IsNotEmpty({ message: 'Title is required.' })
  title: string;

  @IsString({ message: 'Project name must be a string.' })
  @IsNotEmpty({ message: 'Project name is required.' })
  projectName: string;

  @IsString({ message: 'Purchase number must be a string.' })
  @IsNotEmpty({ message: 'Purchase number is required.' })
  purchaseNumber: string;

  @Type(() => Number)
  @IsPositive({ message: 'Quantity must be a positive number.' })
  quantity: number;

  @IsEnum(Category, {
    message: 'Category must be a valid category from the predefined options.',
  })
  category: Category;

  @IsString({ message: 'Detail must be a string.' })
  @IsOptional()
  detail?: string;

  @IsDateString({}, { message: 'Deadline must be a valid ISO date string.' })
  deadline: Date;
}
