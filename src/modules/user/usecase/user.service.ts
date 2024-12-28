import { ConflictException, Injectable } from '@nestjs/common';
import { UserRepository } from '../persistence/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { HashPassword } from '../utility/generate.hash';
import { User } from '../persistence/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(createUserDto: CreateUserDto) {
    const {
      firstName,
      lastName,
      companyName,
      telephone,
      email,
      password,
      lastRole,
      profile,
    } = createUserDto;

    const formattedEmail = email.toLowerCase();

    const user = await this.userRepository.findByEmail(formattedEmail);

    if (user) {
      throw new ConflictException('Email is already in use');
    }
    const hashedPassword = await HashPassword.generateHashPassword(password);
    return await this.userRepository.createUser(
      firstName,
      lastName,
      companyName,
      telephone,
      formattedEmail,
      hashedPassword,
      lastRole,
      profile,
    );
  }

  // a method to find a user by their id
  async findById(id: string): Promise<User> {
    return this.userRepository.findById(id);
  }

  // a method to find a user by their email
  async findByEmail(email: string): Promise<User> {
    const formattedEmail = email.toLowerCase();
    return this.userRepository.findByEmail(formattedEmail);
  }

  // a method to store refresh token
  async storeRefreshToken(userId: string, refreshToken: string) {
    return this.userRepository.storeRefreshToken(userId, refreshToken);
  }

  // a method to increment token version
  //increment token version
  async incrementTokenVersion(userId: string) {
    return this.userRepository.incrementTokenVersion(userId);
  }
}
