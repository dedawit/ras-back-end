import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from '../usecase/user.service';
import { CreateUserDto } from '../usecase/dto/create-user.dto';
import { SerializeResponse } from 'src/modules/common/serialize-response.decorator';
import { CreateUserResponseDto } from '../usecase/dto/create-user-response.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @SerializeResponse(CreateUserResponseDto)
  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.userService.createUser(createUserDto);
  }
}
