import { ConflictException, Injectable } from '@nestjs/common';
import { UserRepository } from '../persistence/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { HashPassword } from '../utility/generate.hash';

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

    const user = await this.userRepository.getUserByEmail(email);

    if (user) {
      throw new ConflictException('Email is already in use');
    }
    const hashedPassword = await HashPassword.generateHashPassword(password);
    return await this.userRepository.createUser(
      firstName,
      lastName,
      companyName,
      telephone,
      email,
      hashedPassword,
      lastRole,
      profile,
    );
  }
}
