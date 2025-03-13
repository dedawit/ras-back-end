import { ConflictException, Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../persistence/user.entity';
import { Role } from '../utility/enums/role.enum';
import { HashPassword } from '../utility/generate.hash';
import { CreateBusinessOwnerDto } from './dto/create-business-owner.dto';

@Injectable()
export class BusinessOwnerService extends UserService {
  protected lastRole: Role;
  protected companyName: string;

  constructor(private readonly userService: UserService) {
    super(userService['userRepository']);
  }

  public async createUser(
    createUserDto: CreateBusinessOwnerDto,
  ): Promise<User> {
    const {
      firstName,
      lastName,
      telephone,
      email,
      password,
      profile,
      lastRole,
      companyName,
    } = createUserDto;

    const formattedEmail = email.toLowerCase();

    const existingUser = await this.userService.findByEmail(formattedEmail);
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const hashedPassword = await HashPassword.generateHashPassword(password);

    const user = await this.userService['userRepository'].createUser(
      firstName,
      lastName,
      telephone,
      formattedEmail,
      hashedPassword,
      profile,
      lastRole,
      companyName,
    );

    this.syncWithUser(user);
    this.lastRole = lastRole;
    this.companyName = companyName;

    return user;
  }
}
