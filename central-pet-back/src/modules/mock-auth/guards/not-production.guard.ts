import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

/**
 * Impede acesso ao recurso se o ambiente for produção.
 * Útil para proteger rotas/serviços de mock.
 */
@Injectable()
export class NotProductionGuard implements CanActivate {
  canActivate(this: void, _context: ExecutionContext): boolean {
    if (process.env.NODE_ENV === 'production') {
      throw new UnauthorizedException('Acesso não permitido em produção');
    }
    return true;
  }
}
