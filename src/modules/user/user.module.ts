import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { UserService } from './usecase/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './persistence/user.entity';
import { UserRepository } from './persistence/user.repository';

import { BusinessOwnerService } from './usecase/business-owner.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UserRepository, BusinessOwnerService],

  exports: [UserService, UserRepository],
})
export class UserModule {}
