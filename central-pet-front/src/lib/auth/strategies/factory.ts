import type { AuthStrategy } from '@/Models';
import { MockAuthStrategy } from './mock.strategy';
import { JwtAuthStrategy } from './jwt.strategy';

/**
 * Tipos de estratégia de autenticação disponíveis.
 */
export type AuthStrategyType = 'mock' | 'jwt';

/**
 * Cria a estratégia de autenticação apropriada com base no ambiente.
 *
 * @returns Instância de AuthStrategy com base na variável VITE_AUTH_STRATEGY.
 *          Retorna JwtAuthStrategy por padrão.
 *          Retorna MockAuthStrategy quando VITE_AUTH_STRATEGY='mock'.
 */
export function createAuthStrategy(): AuthStrategy {
  const strategyType = (import.meta.env.VITE_AUTH_STRATEGY as AuthStrategyType) || 'jwt';

  if (strategyType === 'mock') {
    return new MockAuthStrategy();
  }

  return new JwtAuthStrategy();
}
