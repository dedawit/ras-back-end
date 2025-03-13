// buyer.service.ts
import { Injectable } from '@nestjs/common';
import { BusinessOwnerService } from './business-owner.service';
import { Role } from '../utility/enums/role.enum';
import { UserService } from './user.service';

@Injectable()
export class BuyerService extends BusinessOwnerService {
  constructor(userService: UserService) {
    super(userService);
    this.lastRole = Role.BUYER;
  }
}
