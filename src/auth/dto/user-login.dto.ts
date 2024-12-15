import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be valid' })
  @Length(1, 255, { message: 'Email must be between 1 and 255 characters' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @Length(6, 255, { message: 'Password must be at least 6 characters long' })
  password: string;
}
