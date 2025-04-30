import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/modules/user/usecase/user.service';
import { JwtPayload } from '../interface/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    // Whatever you return here gets attached to `req.user`
    return {
      sub: payload.sub, // User ID
      email: payload.email,
      lastRole: payload.lastRole,
      tokenVersion: payload.tokenVersion,
    };
  }
}
