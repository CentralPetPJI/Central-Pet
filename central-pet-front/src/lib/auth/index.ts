/**
 * Auth Abstraction Layer - Barrel Export
 *
 * Re-exports all auth types, strategies, and factory for convenient imports.
 */

// Types
export type {
  AuthUser,
  AuthStrategy,
  AuthContextValue,
  LoginCredentials,
  RegisterData,
} from './types';

// Strategies
export { MockAuthStrategy } from './strategies/mock.strategy';
export { JwtAuthStrategy } from './strategies/jwt.strategy';
export { createAuthStrategy, type AuthStrategyType } from './strategies/factory';
