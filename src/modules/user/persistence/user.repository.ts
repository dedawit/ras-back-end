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
    companyName: string,
    telephone: string,
    email: string,
    password: string,
    lastRole: Role,
    profile?: string,
  ): Promise<User> {
    const user = this.userRepository.create({
      firstName,
      lastName,
      companyName,
      telephone,
      email,
      password,
      lastRole,
      profile,
    });
    return this.userRepository.save(user);
  }

  async getUserByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }
}
