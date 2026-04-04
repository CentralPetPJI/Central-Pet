/**
 * JWT Authentication Strategy
 *
 * TODO (v1.1): Implement real JWT authentication
 * - POST /auth/login → returns JWT in httpOnly cookie
 * - POST /auth/logout → clears cookie
 * - POST /auth/register → creates account, returns JWT
 * - GET /auth/me → returns current user from token
 * - Token refresh logic
 */

import type { AuthStrategy, AuthUser, LoginCredentials, RegisterData } from '../types';

/**
 * JWT authentication strategy skeleton.
 *
 * Will be implemented in v1.1 when real authentication is needed.
 * For now, all methods throw "not implemented" errors.
 */
export class JwtAuthStrategy implements AuthStrategy {
  readonly type = 'jwt' as const;

  /**
   * Initialize JWT auth.
   * TODO (v1.1): Check for existing session/token.
   */
  async initialize(): Promise<void> {
    // TODO (v1.1): Check for existing session/token
  }

  /**
   * Get current user from JWT token.
   * TODO (v1.1): GET /auth/me with JWT cookie.
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    throw new Error('JWT auth not implemented. Coming in v1.1.');
  }

  /**
   * Login with email/password credentials.
   * TODO (v1.1): POST /auth/login.
   */
  async login(_credentials: LoginCredentials): Promise<AuthUser> {
    throw new Error('JWT auth not implemented. Coming in v1.1.');
  }

  /**
   * Logout and clear session.
   * TODO (v1.1): POST /auth/logout.
   */
  async logout(): Promise<void> {
    throw new Error('JWT auth not implemented. Coming in v1.1.');
  }

  /**
   * Register a new user account.
   * TODO (v1.1): POST /auth/register.
   */
  async register(_data: RegisterData): Promise<AuthUser> {
    throw new Error('JWT auth not implemented. Coming in v1.1.');
  }
}
