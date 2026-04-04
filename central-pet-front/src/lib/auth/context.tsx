/*
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

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const logout = useCallback(async () => {
    await strategy.logout();
    setCurrentUser(null);
  }, [strategy]);

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
      } finally {
        await refreshCurrentUser();
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
      login,
      logout,
      register,
      selectUser,
    }),
    [currentUser, users, isLoading, login, logout, register, selectUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
