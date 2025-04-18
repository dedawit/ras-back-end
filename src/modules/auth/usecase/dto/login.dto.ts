import { IsString } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'email must be a string' })
  email: string;

  @IsString({ message: 'password must be a string' })
  password: string;
}
