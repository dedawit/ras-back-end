import { IsString, IsInt, IsOptional, IsBoolean, IsDate, IsNotEmpty, IsPositive } from 'class-validator';

export class createRFQDTO {
  @IsString({ message: 'Product name must be a string.' })
  @IsNotEmpty({ message: 'Product name should not be empty.' })
  productName: string;

  @IsInt({ message: 'Quantity must be an integer.' })
  @IsPositive({ message: 'Quantity must be a positive number.' })
  quantity: number;

  @IsString({ message: 'Category must be a string.' })
  @IsNotEmpty({ message: 'Category should not be empty.' })
  category: string;

  @IsString({ message: 'Detail must be a string.' })
  @IsNotEmpty({ message: 'Detail should not be empty.' })
  detail: string;

  @IsBoolean({ message: 'State must be a boolean value true/false.' })
  state: boolean;

  @IsString({ message: 'File must be a string.' })
  @IsNotEmpty({ message: 'File should not be empty.' })
  file: string;

  @IsDate({ message: 'Deadline must be a valid date.' })
  @IsOptional()
  deadline: Date;
}
