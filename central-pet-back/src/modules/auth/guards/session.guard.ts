import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { MockUser, mockUsers } from '@/mocks';
import { AuthService } from '@/modules/auth/auth.service';
import {
  isMockAuthEnabled,
  parseSessionCookieValue,
  SESSION_COOKIE_NAME,
} from '@/utils/session-cookie';
import { PublicUser } from '@/modules/users/users.service';

interface AuthenticatedRequest extends Request {
  user?: PublicUser | MockUser;
}

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const rawSessionCookie = request.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
    const parsedSession = parseSessionCookieValue(rawSessionCookie);

    if (!parsedSession) {
      throw new UnauthorizedException('Autenticação necessária');
    }

    if (parsedSession.mode === 'mock') {
      if (!isMockAuthEnabled()) {
        throw new UnauthorizedException('Autenticação necessária');
      }

      // TODO: será que vale a pena usar criar uma sessao mock no banco e usar o authService pra pegar o user? ou é melhor deixar assim mesmo, sem passar pelo banco?
      const user = mockUsers.find((mockUser) => mockUser.id === parsedSession.value);

      if (!user) {
        throw new UnauthorizedException('Autenticação necessária');
      }

      request.user = user;
      return true;
    }

    const result = await this.authService.getAuthenticatedUser(parsedSession.value);
    request.user = result.data.user;

    return true;
  }
}
