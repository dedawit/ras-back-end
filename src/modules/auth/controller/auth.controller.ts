import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../usecase/auth.service';
import { LoginDto } from '../usecase/dto/login.dto';
import { RefreshTokenDto } from '../usecase/dto/refresh-token.dto';
import { LoginResponseDto } from '../usecase/dto/login-response.dto';
import { SerializeResponse } from 'src/modules/common/serialize-response.decorator';

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
}
