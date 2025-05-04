import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../usecase/auth.service';
import { LoginDto } from '../usecase/dto/login.dto';
import { RefreshTokenDto } from '../usecase/dto/refresh-token.dto';
import { LoginResponseDto } from '../usecase/dto/login-response.dto';
import { SerializeResponse } from 'src/modules/common/serialize-response.decorator';
import { JwtAuthGuard } from '../guard/auth.guard';
import { LogoutResponseDto } from '../usecase/dto/logout-response.dto';

interface UserPayload {
  sub: string;
  email: string;
  lastRole: string;
  tokenVersion: number;
}

interface AuthenticatedRequest extends Request {
  user: UserPayload;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @SerializeResponse(LoginResponseDto)
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.authService.validateUser(email, password);
    return this.authService.login(user);
  }

  @Post('refresh-token')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  // @SerializeResponse(LogoutResponseDto)
  async logout(@Req() req: AuthenticatedRequest) {
    return this.authService.logout(req.user.sub);
  }
}
