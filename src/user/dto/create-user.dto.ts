import { IsString, IsEmail, Length, IsPhoneNumber, IsNotEmpty, IsEnum } from 'class-validator';
import { Role } from '../enums/role.enum';

export class CreateUserDto {
  @IsNotEmpty({ message: 'First name is required' })
  @IsString({ message: 'First name must be a string' })
  @Length(1, 255, { message: 'First name must be between 1 and 255 characters' })
  firstName: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @IsString({ message: 'Last name must be a string' })
  @Length(1, 255, { message: 'Last name must be between 1 and 255 characters' })
  lastName: string;

  @IsNotEmpty({ message: 'Company name is required' })
  @IsString({ message: 'Company name must be a string' })
  @Length(1, 255, { message: 'Company name must be between 1 and 255 characters' })
  companyName: string;

  @IsPhoneNumber('ET' as any, { message: 'Phone number must be valid' })
  telephone?: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be valid' })
  @Length(1, 255, { message: 'Email must be between 1 and 255 characters' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @Length(6, 255, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsEnum(Role, { message: 'Last role must be either buyer or seller' })
  lastRole: Role;

  @IsString({ message: 'Profile must be a string' })
  @Length(1, 255, { message: 'Profile must be between 1 and 255 characters' })
  profile?: string;
}
