import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from './api';
import {
  clearStoredMockUserId,
  getStoredMockUserId,
  setStoredMockUserId,
  type MockUsersResponse,
} from './mock-auth';

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: 'PESSOA_FISICA' | 'ONG';
  birthDate?: string;
  cpf?: string;
  organizationName?: string;
  cnpj?: string;
  createdAt: string;
  updatedAt: string;
};

type AuthContextValue = {
  currentUser: AuthUser | null;
  mockUsers: AuthUser[];
  isLoading: boolean;
  refreshAuth: () => Promise<void>;
  clearAuth: () => void;
  selectMockUser: (userId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [mockUsers, setMockUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMockUsers = async () => {
    const response = await api.get<MockUsersResponse>('/auth/mock-users');
    const { users } = response.data.data;
    const storedMockUserId = getStoredMockUserId();
    const hasStoredUser = storedMockUserId
      ? users.some((user: AuthUser) => user.id === storedMockUserId)
      : false;

    setMockUsers(users);

    if (!hasStoredUser && storedMockUserId) {
      clearStoredMockUserId();
    }
  };

  const refreshAuth = async () => {
    try {
      const response = await api.get<{ data: { user: AuthUser } }>('/auth/me');
      setCurrentUser(response.data.data.user);
    } catch {
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const selectMockUser = async (userId: string) => {
    setStoredMockUserId(userId);
    await refreshAuth();
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        await loadMockUsers();
      } finally {
        await refreshAuth();
      }
    };

    void bootstrapAuth();
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      mockUsers,
      isLoading,
      refreshAuth,
      clearAuth: () => {
        clearStoredMockUserId();
        setCurrentUser(null);
      },
      selectMockUser,
    }),
    [currentUser, isLoading, mockUsers, selectMockUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
