/**
 * Hook useAuth
 *
 * Fornece acesso ao estado e às ações de autenticação a partir do AuthContext.
 */

import { useContext } from 'react';
import { AuthContext } from './context';
import type { AuthContextValue } from '@/Models';

/**
 * Hook para acessar o estado e as ações de autenticação.
 *
 * @returns Contexto de autenticação com:
 * - currentUser: usuário autenticado atual (null se não autenticado)
 * - isLoading: indica se o estado de autenticação está carregando
 * - isAuthenticated: atalho booleano para currentUser !== null
 * - login(credentials): autentica com email/senha (estratégia JWT)
 * - logout(): encerra a sessão atual
 * - register(data): cria nova conta (estratégia JWT)
 * - users: usuários disponíveis para seleção no modo mock
 * - selectUser(userId): seleciona usuário disponível no modo mock
 *
 * @throws Error se usado fora do AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
