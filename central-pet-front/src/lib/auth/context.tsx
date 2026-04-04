/**
 * Auth Context with Strategy Pattern
 *
 * This module provides the AuthProvider and AuthContext that use
 * the strategy pattern for authentication. The strategy is created
 * via the factory based on environment configuration.
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
} from './types';
import { createAuthStrategy } from './strategies/factory';

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [mockUsers, setMockUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create strategy once on mount
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

  const selectMockUser = useCallback(
    async (userId: string) => {
      if (!strategy.selectMockUser) {
        console.warn('selectMockUser not available for this auth strategy');
        return;
      }
      await strategy.selectMockUser(userId);
      await refreshCurrentUser();
    },
    [strategy, refreshCurrentUser],
  );

  // Backwards compatibility alias for clearAuth
  const clearAuth = useCallback(async () => {
    await logout();
  }, [logout]);

  // Initialize on mount
  useEffect(() => {
    const bootstrap = async () => {
      try {
        await strategy.initialize();

        // Load mock users if available
        if (strategy.getMockUsers) {
          const users = await strategy.getMockUsers();
          setMockUsers(users);
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
      mockUsers,
      isLoading,
      isAuthenticated: currentUser !== null,
      login,
      logout,
      register,
      selectMockUser,
      clearAuth,
    }),
    [currentUser, mockUsers, isLoading, login, logout, register, selectMockUser, clearAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
