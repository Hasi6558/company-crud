import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from 'src/users/users.service';
import { PERMISSION_KEY } from './permission.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    //get required permission from the metadata
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get users with role and permissions
    const userWithPermissions = await this.usersService.findOneWithPermissions(user.id);

    console.log('User with permissions:', userWithPermissions);

    if (!userWithPermissions) {
      throw new ForbiddenException('User not found');
    }

    // Extract all permissions from user's roles
    const userPermissions: string[] = [];

    if (userWithPermissions.roles) {
      userWithPermissions.roles.forEach((role) => {
        const permissions = role.permissions as Array<{ name: string }> | undefined;
        if (permissions) {
          permissions.forEach((permission) => {
            if (permission?.name) {
              userPermissions.push(permission.name);
            }
          });
        }
      });
    }

    // Check if user has required permissions
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
