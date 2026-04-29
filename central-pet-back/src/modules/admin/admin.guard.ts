import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { PublicUser } from '@/modules/users/users.service';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: PublicUser }>();
    const user = request.user;

    if (!user || (user.role !== 'ADMIN' && user.role !== 'ROOT')) {
      throw new ForbiddenException('Acesso restrito a administradores');
    }

    return true;
  }
}
