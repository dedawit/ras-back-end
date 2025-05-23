import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { Role } from '../utility/enums/role.enum';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(
    firstName: string,
    lastName: string,
    telephone: string,
    email: string,
    password: string,
    profile?: string,
    lastRole?: Role,
    companyName?: string,
  ): Promise<User> {
    const user = this.userRepository.create({
      firstName,
      lastName,
      telephone,
      email,
      password,
      profile,
      lastRole,
      companyName,
    });

    return this.userRepository.save(user);
  }

  async findById(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  // a method to find user by email
  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  // a method to store refresh token
  async storeRefreshToken(userId: string, refreshToken: string) {
    const user = await this.findById(userId);
    Object.assign(user, { refreshToken });
    return this.userRepository.save(user);
  }

  //increment token version
  async incrementTokenVersion(userId: string) {
    const user = await this.findById(userId);
    Object.assign(user, { tokenVersion: user.tokenVersion + 1 });
    return this.userRepository.save(user);
  }

  //switch role
  async switchRole(user: User): Promise<User> {
    const newRole = user.lastRole === Role.BUYER ? Role.SELLER : Role.BUYER;

    Object.assign(user, { lastRole: newRole });

    return this.userRepository.save(user);
  }
}
