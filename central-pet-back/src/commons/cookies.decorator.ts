import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface RequestWithCookies extends Request {
  cookies: Record<string, string>;
}

export const Cookies = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<RequestWithCookies>();

  return data ? request.cookies[data] : request.cookies;
});
