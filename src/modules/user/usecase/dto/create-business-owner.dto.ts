import {
  IsString,
  IsEmail,
  Length,
  IsPhoneNumber,
  IsNotEmpty,
  IsEnum,
  Matches,
  IsOptional,
} from 'class-validator';
import { Role } from '../../utility/enums/role.enum';

export class CreateBusinessOwnerDto {
  @IsNotEmpty({ message: 'First name is required' })
  @IsString({ message: 'First name must be a string' })
  firstName: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @IsString({ message: 'Last name must be a string' })
  lastName: string;

  @IsPhoneNumber('ET' as any, { message: 'Phone number must be valid' })
  telephone: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be valid' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&,.])[A-Za-z\d@$!%*?&,.]{10,}$/,
    {
      message:
        'Password must be at least 10 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )
  password: string;

  @IsString({ message: 'Profile must be a string' })
  @IsOptional()
  profile?: string;

  @IsEnum(Role, { message: 'Last role must be a valid role value' })
  @IsNotEmpty()
  lastRole: Role;

  @IsString({ message: 'Company name must be a string' })
  @IsNotEmpty()
  companyName: string;
}
