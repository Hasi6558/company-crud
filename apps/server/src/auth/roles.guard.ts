import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Roles } from './roles.decorator';

interface AuthenticatedRequest {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

function matchRoles(requiredRoles: string[], userRoles: string[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // No roles required
  }

  if (!userRoles || userRoles.length === 0) {
    return false; // User has no roles
  }

  // Check if user has at least one of the required roles
  return requiredRoles.some((role) => userRoles.includes(role));
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get(Roles, context.getHandler());

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user || !user.roles) {
      return false; // No user authenticated or no roles
    }

    return matchRoles(roles, user.roles);
  }
}
