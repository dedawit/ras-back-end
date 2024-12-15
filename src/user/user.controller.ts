import { Controller, Get, Post, Body, Patch, Param, Delete,ParseIntPipe, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('user')
// @UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
   @Get(':id')
   async getUserById(@Param('id', ParseIntPipe) id: number) {
     return this.userService.getUserById(id);
   }
 
   @UseGuards(JwtAuthGuard)
   @Patch(':id')
   async updateUser(
     @Param('id', ParseIntPipe) id: number,
     @Body() updateUserDto: UpdateUserDto,
   ) {
     return this.userService.updateUser(id, updateUserDto);
   }

   @UseGuards(JwtAuthGuard)
   @Patch(':id/change-password')
   async changePassword(
     @Param('id', ParseIntPipe) id: number,
     @Body() changePasswordDto: ChangePasswordDto,
   ) {
     return this.userService.changePassword(id, changePasswordDto);
   }

}
