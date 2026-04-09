import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { mockUsers } from '@/mocks';
import { AuthService } from '../auth.service';
import {
  isMockAuthEnabled,
  parseSessionCookieValue,
  SESSION_COOKIE_NAME,
} from '@/utils/session-cookie';

interface AuthenticatedRequest extends Request {
  user?: unknown;
}

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const rawSessionCookie = request.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
    const parsedSession = parseSessionCookieValue(rawSessionCookie);

    if (!parsedSession) {
      throw new UnauthorizedException('Authentication required');
    }

    if (parsedSession.mode === 'mock') {
      if (!isMockAuthEnabled()) {
        throw new UnauthorizedException('Authentication required');
      }

      const user = mockUsers.find((mockUser) => mockUser.id === parsedSession.value);

      if (!user) {
        throw new UnauthorizedException('Authentication required');
      }

      request.user = user;
      return true;
    }

    const result = await this.authService.getAuthenticatedUser(parsedSession.value);
    request.user = result.data.user;

    return true;
  }
}
