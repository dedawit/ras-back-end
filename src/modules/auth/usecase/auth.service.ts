import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/modules/user/persistence/user.entity';
import { UserService } from 'src/modules/user/usecase/user.service';
import { HashPassword } from 'src/modules/user/utility/generate.hash';
import { JwtPayload } from '../interface/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (
      !user ||
      !(await HashPassword.comparePassword(user.password, password))
    ) {
      throw new BadRequestException('Invalid credentials');
    }

    return user;
  }

  async login(user: User) {
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      lastRole: user.lastRole,
      tokenVersion: user.tokenVersion,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_JWT_SECRET,
      expiresIn: '7d',
    });

    await this.userService.storeRefreshToken(user.id, refreshToken);

    return { ...user, accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    const decoded = this.jwtService.verify(refreshToken, {
      secret: process.env.REFRESH_JWT_SECRET,
    });

    const user = await this.userService.findById(decoded.sub);

    if (!user) {
      throw new Error('Invalid refresh token');
    }

    if (user.tokenVersion !== decoded.tokenVersion) {
      throw new Error('Token has been invalidated');
    }

    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      lastRole: user.lastRole,
      tokenVersion: user.tokenVersion,
    };
    const newAccessToken = this.jwtService.sign(payload);

    return { accessToken: newAccessToken };
  }

  //a method to revoke tokens
  async revokeTokens(userId: string): Promise<void | User> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return this.userService.incrementTokenVersion(userId);
  }
}
