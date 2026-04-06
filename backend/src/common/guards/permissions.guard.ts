import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) return true;

    const { user } = context.switchToHttp().getRequest();

    // Collect all permission names from all roles
    const userPermissions = new Set<string>();
    for (const role of user?.roles ?? []) {
      for (const perm of role.permissions ?? []) {
        userPermissions.add(perm.name ?? perm);
      }
    }

    return requiredPermissions.every((p) => userPermissions.has(p));
  }
}
