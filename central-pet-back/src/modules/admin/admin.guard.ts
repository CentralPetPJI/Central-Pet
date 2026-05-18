import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { PublicUser } from '@/modules/users/users.service';
import { UserPersistenceService } from '@/modules/users/user-persistence.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly userPersistence: UserPersistenceService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: PublicUser }>();
    const user = request.user;

    if (!user || (user.role !== 'ADMIN' && user.role !== 'ROOT')) {
      throw new ForbiddenException('Acesso restrito a administradores');
    }

    await this.userPersistence.validateUser(user.id);
    return true;
  }
}
