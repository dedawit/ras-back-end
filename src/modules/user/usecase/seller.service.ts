import { Injectable } from '@nestjs/common';
import { BusinessOwnerService } from './business-owner.service';
import { Role } from '../utility/enums/role.enum';
import { UserService } from './user.service';

@Injectable()
export class SellerService extends BusinessOwnerService {
  constructor(userService: UserService) {
    super(userService);
    this.lastRole = Role.SELLER;
  }
}
