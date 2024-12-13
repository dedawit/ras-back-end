import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Old password is required' })
  @IsString({ message: 'Old password must be a string' })
  @Length(6, 255, { message: 'Old password must be at least 6 characters long' })  
  oldPassword: string;

  @IsNotEmpty({ message: 'New password is required' })
  @IsString({ message: 'New password must be a string' })
  @Length(6, 255, { message: 'New password must be at least 6 characters long' })  
  newPassword: string;
}
