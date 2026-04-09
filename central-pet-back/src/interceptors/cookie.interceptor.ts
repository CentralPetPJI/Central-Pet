import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Response } from 'express';
import { Observable, map } from 'rxjs';
import { SESSION_COOKIE_NAME } from '@/utils/session-cookie';

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
      map((data) => {
        // Handle non-object payloads
        if (!data || typeof data !== 'object') {
          return data;
        }

        if (data.__clearSessionCookie) {
          this.clearSessionCookie(response);
          // Remove the internal flag from response
          const { __clearSessionCookie, ...sanitized } = data;
          return sanitized;
        }

        const sessionId = data?.data?.sessionId;

        if (sessionId) {
          this.setSessionCookie(response, sessionId);
          // Remove sessionId from the nested data object
          const { data: nestedData, ...rest } = data;
          if (nestedData) {
            const { sessionId: _, ...sanitizedNestedData } = nestedData;
            return {
              ...rest,
              data: sanitizedNestedData,
            };
          }
        }

        return data;
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
