import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AuditService } from '@/modules/audit/audit.service';
import { AUDIT_ACTION_KEY, type AuditActionOptions } from '@/decorators/audit-action.decorator';
import type { Request } from 'express';
import type { PublicUser } from '@/modules/users/users.service';
import type { MockUser } from '@/mocks';

type AuthenticatedUser = PublicUser | MockUser;
type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const metadata = this.reflector.get<string | AuditActionOptions | undefined>(
      AUDIT_ACTION_KEY,
      context.getHandler(),
    );

    const method = String(request.method || '').toUpperCase();
    const hasDecorator = metadata !== undefined;
    const shouldAudit = ['POST', 'PATCH', 'DELETE'].includes(method) || hasDecorator;

    if (!shouldAudit) {
      return next.handle();
    }

    const user = request.user;
    if (!user || !user.id) {
      return next.handle();
    }

    // derive action and optional target info
    let action: string | undefined;
    let targetType: string | undefined;
    let targetId: string | undefined;

    if (typeof metadata === 'string') {
      action = metadata;
    } else if (metadata && typeof metadata === 'object') {
      action = metadata.action;
      targetType = metadata.targetType;
      if (metadata.targetIdParam) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const paramVal =
          (request.params && (request.params as Record<string, any>)[metadata.targetIdParam]) ||
          (request.body && (request.body as Record<string, any>)[metadata.targetIdParam]);
        if (typeof paramVal === 'string' || typeof paramVal === 'number') {
          targetId = String(paramVal);
        }
      }
    }

    // fallback action
    const computedAction = action ?? `${method} ${request.url}`;

    // Fire-and-forget audit create; swallow errors to avoid affecting request flow
    return next.handle().pipe(
      tap(() => {
        void this.auditService
          .create({
            userId: user.id,
            action: computedAction,
            targetId: targetId ?? null,
            targetType: targetType ?? null,
            details: {
              method,
              url: request.url,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              body: request.body,
            },
          })
          .catch(() => undefined);
      }),
    );
  }
}
