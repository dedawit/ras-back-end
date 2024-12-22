import { Exclude, Expose } from 'class-transformer';
import { Role } from 'src/modules/user/utility/enums/role.enum';

export class LoginResponseDto {
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

  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;

  @Exclude()
  password: string;

  @Exclude()
  tokenVersion: string;
}
