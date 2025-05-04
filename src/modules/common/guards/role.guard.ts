import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from 'src/modules/user/usecase/user.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      throw new ForbiddenException('No user ID found in JWT payload.');
    }

    // Fetch user from database to get the latest lastRole
    const dbUser = await this.userService.findById(user.sub);

    if (!dbUser || !requiredRoles.includes(dbUser.lastRole)) {
      throw new ForbiddenException('Access denied because of role.');
    }

    // Update request.user with the latest lastRole for downstream use
    request.user.lastRole = dbUser.lastRole;

    return true;
  }
}
