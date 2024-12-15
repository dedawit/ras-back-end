import { Exclude, Expose } from 'class-transformer';
import { Role } from '../../utility/enums/role.enum';

export class CreateUserResponseDto {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  companyName: string;

  @Expose()
  telephone: string;

  @Expose()
  email: string;

  @Expose()
  lastRole: Role;

  @Expose()
  profile?: string;

  @Exclude()
  password: string;
}
