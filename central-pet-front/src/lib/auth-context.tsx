/* eslint-disable react-refresh/only-export-components */
/**
 * CAMADA DE COMPATIBILIDADE RETROATIVA
 * CAMADA DE COMPATIBILIDADE RETROATIVA
 *
 * Este arquivo reexporta a nova estrutura do módulo de autenticação.
 * Imports existentes de '@/lib/auth-context' continuam funcionando.
 *
 * Novos códigos devem importar de '@/lib/auth'.
 */

// Reexporta tudo que os consumidores usam atualmente
export { AuthProvider, useAuth } from './auth';
export type { AuthUser } from './auth';
