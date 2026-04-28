/* eslint-disable react-refresh/only-export-components */
/**
 * Contexto de autenticação com padrão de estratégia
 *
 * Este módulo fornece o AuthProvider e o AuthContext que usam
 * o padrão de estratégia para autenticação. A estratégia é criada
 * via factory com base na configuração do ambiente.
 */

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  AuthContextValue,
  AuthStrategy,
  AuthUser,
  LoginCredentials,
  RegisterData,
} from '@/Models';
import { createAuthStrategy } from './strategies/factory';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Cria a estratégia uma única vez na montagem
  const strategyRef = useRef<AuthStrategy | null>(null);
  if (!strategyRef.current) {
    strategyRef.current = createAuthStrategy();
  }
  const strategy = strategyRef.current;

  const refreshCurrentUser = useCallback(async () => {
    try {
      const user = await strategy.getCurrentUser();
      setCurrentUser(user);
    } catch {
      setCurrentUser(null);
    }
  }, [strategy]);

  const syncCurrentUser = useCallback((user: AuthUser | null) => {
    setCurrentUser(user);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      try {
        const user = await strategy.login(credentials);
        setCurrentUser(user);
      } finally {
        setIsLoading(false);
      }
    },
    [strategy],
  );

  const logout = useCallback(
    async (redirectTo?: string) => {
      try {
        await strategy.logout();
      } finally {
        setCurrentUser(null);
        if (redirectTo) {
          navigate(redirectTo);
        } else {
          navigate('/');
        }
      }
    },
    [strategy, navigate],
  );

  const register = useCallback(
    async (data: RegisterData) => {
      setIsLoading(true);
      try {
        const user = await strategy.register(data);
        setCurrentUser(user);
      } finally {
        setIsLoading(false);
      }
    },
    [strategy],
  );

  const selectUser = useCallback(
    async (userId: string) => {
      if (!strategy.selectUser) {
        throw new Error('selectUser not available for this auth strategy');
      }
      await strategy.selectUser(userId);
      await refreshCurrentUser();
    },
    [strategy, refreshCurrentUser],
  );

  // Inicializa na montagem
  useEffect(() => {
    const bootstrap = async () => {
      try {
        await strategy.initialize();

        if (strategy.getUsers) {
          const availableUsers = await strategy.getUsers();
          setUsers(availableUsers);
        }

        // Só tenta recuperar o usuário atual após initialize() completar
        // Isso garante que em modo mock, o userId já estará no localStorage
        await refreshCurrentUser();
      } catch {
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, [strategy, refreshCurrentUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      users,
      isLoading,
      isAuthenticated: currentUser !== null,
      syncCurrentUser,
      login,
      logout,
      register,
      selectUser,
    }),
    [currentUser, users, isLoading, syncCurrentUser, login, logout, register, selectUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
