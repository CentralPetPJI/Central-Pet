import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import type { Request } from 'express';
import { parseSessionCookieValue, SESSION_COOKIE_NAME } from '@/utils/session-cookie';

interface RequestWithCookies extends Request {
  cookies: Record<string, string>;
}

@Injectable()
export class MockModeGuard implements CanActivate {
  canActivate(this: void, context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestWithCookies>();
    const sessionCookie: string | undefined = req.cookies
      ? req.cookies[SESSION_COOKIE_NAME]
      : undefined;
    const parsedSession = parseSessionCookieValue(sessionCookie);

    if (!parsedSession || parsedSession.mode !== 'mock') {
      throw new ForbiddenException('Mock auth required');
    }

    return true;
  }
}
