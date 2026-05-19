/**
 * Contexto de autenticação com padrão de estratégia
 *
 * Este módulo fornece o AuthProvider e o AuthContext que usam
 * o padrão de estratégia para autenticação. A estratégia é criada
 * via factory com base na configuração do ambiente.
 */

import { createContext, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import type { AuthContextValue } from '@/Models';
import { useNavigate, useLocation } from 'react-router-dom';
import { routes } from '@/routes.tsx';
import { useAuthStore } from '@/storage';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const store = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { currentUser, isLoading, actions } = store;

  // Inicializa na montagem
  useEffect(() => {
    void actions.initialize();
  }, [actions]);

  // Sobrescreve o logout para incluir navegação
  const logout = useCallback(
    async (redirectTo?: string) => {
      await actions.logout();
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate('/');
      }
    },
    [actions, navigate],
  );

  // Redireciona para termos se o usuário estiver logado mas não aceitou os termos
  useEffect(() => {
    if (
      !isLoading &&
      currentUser &&
      !currentUser.acceptedTermsAt &&
      location.pathname !== routes.termsOfResponsibility.path &&
      location.pathname !== routes.login.path &&
      location.pathname !== routes.register.path
    ) {
      navigate(routes.termsOfResponsibility.path);
    }
  }, [currentUser, isLoading, navigate, location.pathname]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...store,
      logout, // Usa a versão com navegação
    }),
    [store, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
