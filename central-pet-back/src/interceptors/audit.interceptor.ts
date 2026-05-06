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

/**
 * Sanitization helpers for audit payloads
 * - Deep clones request body (JSON-safe)
 * - Obfuscates sensitive fields (case-insensitive)
 * - Supports per-route allow/deny rules via ROUTE_SANITIZATION_MAP
 */
const DEFAULT_SENSITIVE_KEYS = new Set([
  'password',
  'currentpassword',
  'newpassword',
  'token',
  'refreshtoken',
  'secret',
  'apikey',
  'api_key',
  'authorization',
]);

type SanitizationRule = { allow?: string[]; deny?: string[] };

const ROUTE_SANITIZATION_MAP: Record<string, SanitizationRule> = {
  // Example: '/auth/change-password': { allow: ['userId'], deny: ['oldPassword'] },
};

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

function obfuscate(obj: unknown, sensitiveKeys: Set<string>): unknown {
  if (Array.isArray(obj)) {
    return obj.map((item) => obfuscate(item, sensitiveKeys));
  }
  if (isPlainObject(obj)) {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      const lower = k.toLowerCase();
      if (sensitiveKeys.has(lower)) {
        result[k] = '[REDACTED]';
      } else {
        result[k] = obfuscate(v, sensitiveKeys);
      }
    }
    return result;
  }
  return obj;
}

function sanitizeRequestBody(body: unknown, routeKey?: string): unknown {
  if (body === undefined || body === null) return null;

  let cloned: unknown;
  try {
    // JSON-safe deep clone; will throw for non-serializable things
    cloned = JSON.parse(JSON.stringify(body));
  } catch {
    // If cloning fails, coerce to a safe JSON representation
    if (typeof body === 'string' || typeof body === 'number' || typeof body === 'boolean') {
      cloned = body;
    } else {
      cloned = null;
    }
  }

  const rules = routeKey ? ROUTE_SANITIZATION_MAP[routeKey] : undefined;
  const sensitive = new Set<string>(DEFAULT_SENSITIVE_KEYS);
  if (rules?.deny) rules.deny.forEach((k) => sensitive.add(k.toLowerCase()));

  if (rules?.allow) {
    const allowedSet = new Set(rules.allow.map((s) => s.toLowerCase()));
    if (isPlainObject(cloned)) {
      const filtered: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(cloned)) {
        if (allowedSet.has(k.toLowerCase())) {
          filtered[k] = v;
        }
      }
      return obfuscate(filtered, sensitive);
    }
    return obfuscate(cloned, sensitive);
  }

  return obfuscate(cloned, sensitive);
}

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
        const paramName = metadata.targetIdParam;
        const params = (request.params as Record<string, unknown> | undefined) ?? undefined;
        const bodyObj = request.body as unknown;
        let paramVal: unknown;

        if (params && Object.prototype.hasOwnProperty.call(params, paramName)) {
          paramVal = params[paramName];
        } else if (
          isPlainObject(bodyObj) &&
          Object.prototype.hasOwnProperty.call(bodyObj, paramName)
        ) {
          paramVal = bodyObj[paramName];
        }

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
        // Safely extract route path if available without assuming runtime shape
        let routePath: string | undefined;
        const maybeRoute = request.route as unknown;
        if (maybeRoute && typeof (maybeRoute as { path?: unknown }).path === 'string') {
          routePath = (maybeRoute as { path: string }).path;
        }

        const sanitizedBody = sanitizeRequestBody(request.body, routePath ?? computedAction);
        void this.auditService
          .create({
            userId: user.id,
            action: computedAction,
            targetId: targetId ?? null,
            targetType: targetType ?? null,
            details: {
              method,
              url: request.url,
              body: sanitizedBody,
            },
          })
          .catch(() => undefined);
      }),
    );
  }
}
