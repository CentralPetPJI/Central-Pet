/**
 * Auth Strategy Factory
 *
 * Creates the appropriate auth strategy based on environment configuration.
 * Set VITE_AUTH_STRATEGY=jwt to use JWT auth (when implemented).
 * Defaults to 'mock' for development and E2E tests.
 */

import type { AuthStrategy } from '../types';
import { MockAuthStrategy } from './mock.strategy';
import { JwtAuthStrategy } from './jwt.strategy';

/**
 * Available auth strategy types.
 */
export type AuthStrategyType = 'mock' | 'jwt';

/**
 * Creates the appropriate auth strategy based on environment.
 *
 * @returns AuthStrategy instance based on VITE_AUTH_STRATEGY env var.
 *          Returns MockAuthStrategy if not set or set to 'mock'.
 *          Returns JwtAuthStrategy if set to 'jwt'.
 */
export function createAuthStrategy(): AuthStrategy {
  const strategyType = (import.meta.env.VITE_AUTH_STRATEGY as AuthStrategyType) || 'mock';

  if (strategyType === 'jwt') {
    return new JwtAuthStrategy();
  }

  return new MockAuthStrategy();
}
