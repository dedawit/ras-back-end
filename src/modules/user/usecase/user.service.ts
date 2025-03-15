import { ConflictException, Injectable } from '@nestjs/common';
import { UserRepository } from '../persistence/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { HashPassword } from '../utility/generate.hash';
import { User } from '../persistence/user.entity';
import { Role } from '../utility/enums/role.enum';
import { RFQ } from 'src/modules/rfq/persistence/rfq.entity';

@Injectable()
export class UserService {
  protected id: string;
  protected firstName: string;
  protected lastName: string;
  protected companyName: string;
  protected telephone: string;
  protected email: string;
  protected password: string;
  protected lastRole: Role;
  protected profile: string | null;
  protected rfqs: RFQ[];
  protected refreshToken: string | null;
  protected tokenVersion: number;

  constructor(private readonly userRepository: UserRepository) {}

  public async createAccount(createUserDto: CreateUserDto): Promise<User> {
    const { firstName, lastName, telephone, email, password, profile } =
      createUserDto;

    const formattedEmail = email.toLowerCase();

    const existingUser = await this.userRepository.findByEmail(formattedEmail);
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const hashedPassword = await HashPassword.generateHashPassword(password);
    const user = await this.userRepository.createUser(
      firstName,
      lastName,
      telephone,
      formattedEmail,
      hashedPassword,
      profile,
    );

    this.syncWithUser(user);
    return user;
  }

  public async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (user) {
      this.syncWithUser(user);
    }
    return user;
  }

  public async findByEmail(email: string): Promise<User> {
    const formattedEmail = email.toLowerCase();
    const user = await this.userRepository.findByEmail(formattedEmail);
    if (user) {
      this.syncWithUser(user);
    }
    return user;
  }

  public async storeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<User> {
    const user = await this.userRepository.storeRefreshToken(
      userId,
      refreshToken,
    );
    this.refreshToken = user.refreshToken;
    return user;
  }

  public async incrementTokenVersion(userId: string): Promise<User> {
    const user = await this.userRepository.incrementTokenVersion(userId);
    this.tokenVersion = user.tokenVersion;
    return user;
  }

  public syncWithUser(user: User): void {
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.companyName = user.companyName;
    this.telephone = user.telephone;
    this.email = user.email;
    this.password = user.password;
    this.lastRole = user.lastRole;
    this.profile = user.profile;
    this.rfqs = user.rfqs;
    this.refreshToken = user.refreshToken;
    this.tokenVersion = user.tokenVersion;
  }
}
