/**
 * Estratégia de autenticação JWT
 *
 * TODO (v1.1): Implementar autenticação JWT real
 * - POST /auth/login → retorna JWT em cookie httpOnly
 * - POST /auth/logout → limpa o cookie
 * - POST /auth/register → cria conta e retorna JWT
 * - GET /auth/me → retorna o usuário atual a partir do token
 * - Lógica de renovação de token
 */

import type { AuthStrategy, AuthUser, LoginCredentials, RegisterData } from '@/Models';

/**
 * Estrutura base da estratégia de autenticação JWT.
 *
 * Será implementada na v1.1 quando autenticação real for necessária.
 * Por enquanto, todos os métodos lançam erros de "não implementado".
 */
export class JwtAuthStrategy implements AuthStrategy {
  readonly type = 'jwt' as const;

  /**
   * Inicializa a autenticação JWT.
   * TODO (v1.1): Verificar sessão/token existente.
   */
  async initialize(): Promise<void> {
    // TODO (v1.1): Verificar sessão/token existente
  }

  /**
   * Obtém o usuário atual a partir do token JWT.
   * TODO (v1.1): GET /auth/me com cookie JWT.
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    throw new Error('JWT auth not implemented. Coming in v1.1.');
  }

  /**
   * Faz login com credenciais de email/senha.
   * TODO (v1.1): POST /auth/login.
   */
  async login(_credentials: LoginCredentials): Promise<AuthUser> {
    throw new Error('JWT auth not implemented. Coming in v1.1.');
  }

  /**
   * Encerra a sessão (logout).
   * TODO (v1.1): POST /auth/logout.
   */
  async logout(): Promise<void> {
    throw new Error('JWT auth not implemented. Coming in v1.1.');
  }

  /**
   * Registra uma nova conta de usuário.
   * TODO (v1.1): POST /auth/register.
   */
  async register(_data: RegisterData): Promise<AuthUser> {
    throw new Error('JWT auth not implemented. Coming in v1.1.');
  }
}
