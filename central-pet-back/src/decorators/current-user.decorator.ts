import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import type { MockUser } from '@/mocks';
import type { PublicUser } from '@/modules/users/users.service';

type AuthenticatedUser = PublicUser | MockUser;
type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (request.user.deleted) {
      throw new UnauthorizedException(
        'Esta conta foi desativada. Entre em contato com o suporte para mais informações.',
      );
    }

    return request.user;
  },
);
