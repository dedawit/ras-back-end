import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../usecase/user.service';
import { CreateUserDto } from '../usecase/dto/create-user.dto';
import { SerializeResponse } from 'src/modules/common/serialize-response.decorator';
import { CreateUserResponseDto } from '../usecase/dto/create-user-response.dto';
import { BusinessOwnerService } from '../usecase/business-owner.service';
import { CreateBusinessOwnerDto } from '../usecase/dto/create-business-owner.dto';
import { JwtAuthGuard } from 'src/modules/auth/guard/auth.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly businessOwnerService: BusinessOwnerService,
  ) {}

  @SerializeResponse(CreateUserResponseDto)
  @Post('create')
  async createUser(@Body() CreateBusinessOwnerDto: CreateBusinessOwnerDto) {
    return await this.businessOwnerService.createAccount(
      CreateBusinessOwnerDto,
    );
  }

  @Patch('switch-role/:userId')
  @SerializeResponse(CreateUserResponseDto)
  @UseGuards(JwtAuthGuard)
  async switchRole(@Param('userId') userId: string) {
    return await this.businessOwnerService.switchRole(userId);
  }
}
