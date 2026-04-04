import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

const SESSION_COOKIE_NAME = 'central_pet_session';

interface AuthenticatedRequest extends Request {
  user?: unknown;
}

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const sessionId = request.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
    const result = await this.authService.getAuthenticatedUser(sessionId);
    request.user = result.data.user;

    return true;
  }
}
