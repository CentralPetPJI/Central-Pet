import type { AuthStrategy } from '@/Models';
import { JwtAuthStrategy } from './jwt.strategy';

/**
 * Tipos de estratégia de autenticação disponíveis.
 */
export type AuthStrategyType = 'mock' | 'jwt';

/**
 * Cria a estratégia de autenticação apropriada com base no ambiente.
 *
 * @returns Instância de AuthStrategy com base na variável VITE_AUTH_STRATEGY.
 *          Retorna MockAuthStrategy se não estiver definida ou estiver como 'mock'.
 *          Retorna JwtAuthStrategy se estiver como 'jwt'.
 */
export function createAuthStrategy(): AuthStrategy {
  return new JwtAuthStrategy();
}
