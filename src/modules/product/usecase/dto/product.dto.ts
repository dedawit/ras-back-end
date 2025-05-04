import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateProductDTO {
  @IsString({ message: 'Title must be a string.' })
  @IsNotEmpty({ message: 'Title is required.' })
  title: string;

  @IsString({ message: 'Category must be a string.' })
  @IsNotEmpty({ message: 'Category is required.' })
  category: string;

  // @IsUrl({}, { message: 'Image must be a valid URL.' })
  // @IsNotEmpty({ message: 'Image URL is required.' })
  // image: string;

  @IsString({ message: 'Detail must be a string.' })
  @IsOptional()
  detail?: string;
}

export class UpdateProductDTO extends PartialType(CreateProductDTO) {}
