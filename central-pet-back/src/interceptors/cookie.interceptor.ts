// src/auth/interceptors/cookie.interceptor.ts

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, tap } from 'rxjs';

const SESSION_COOKIE_NAME = 'central_pet_session';

type InterceptorResponse = {
  data?: {
    sessionId?: string;
  };
  __clearSessionCookie?: boolean;
};

@Injectable()
export class CookieInterceptor implements NestInterceptor<
  InterceptorResponse,
  InterceptorResponse
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<InterceptorResponse>,
  ): Observable<InterceptorResponse> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap((data) => {
        if (data?.__clearSessionCookie) {
          this.clearSessionCookie(response);
          return;
        }

        const sessionId = data?.data?.sessionId;

        if (sessionId) {
          this.setSessionCookie(response, sessionId);
        }
      }),
    );
  }

  private setSessionCookie(res: Response, sessionId: string) {
    res.cookie(SESSION_COOKIE_NAME, sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
    });
  }

  private clearSessionCookie(res: Response) {
    res.clearCookie(SESSION_COOKIE_NAME, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }
}
