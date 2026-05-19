import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AuthContextValue,
  AuthStrategy,
  AuthUser,
  LoginCredentials,
  RegisterData,
} from '@/Models';
import { createAuthStrategy } from '@/lib/auth/strategies/factory';

interface AuthState extends Omit<AuthContextValue, 'strategy'> {
  strategy: AuthStrategy | null;
  actions: {
    initialize: () => Promise<void>;
    refreshCurrentUser: () => Promise<void>;
    syncCurrentUser: (user: AuthUser | null) => void;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    acceptTerms: () => Promise<void>;
    selectUser: (userId: string) => Promise<void>;
    reset: () => void;
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      const initialState = {
        currentUser: null,
        users: [],
        isLoading: true,
        isAuthenticated: false,
        strategy: null,
      };

      return {
        ...initialState,

        // Atalhos para compatibilidade com useAuth
        syncCurrentUser: (user) => get().actions.syncCurrentUser(user),
        login: (credentials) => get().actions.login(credentials),
        logout: () => get().actions.logout(),
        register: (data) => get().actions.register(data),
        acceptTerms: () => get().actions.acceptTerms(),
        selectUser: (userId) => get().actions.selectUser(userId),

        actions: {
          reset: () => {
            set(initialState);
          },

          initialize: async () => {
            const { actions } = get();
            let strategy = get().strategy;

            if (!strategy) {
              strategy = createAuthStrategy();
              set({ strategy });
            }

            try {
              await strategy.initialize();

              if (strategy.getUsers) {
                const availableUsers = await strategy.getUsers();
                set({ users: availableUsers });
              }

              await actions.refreshCurrentUser();
            } catch {
              set({ currentUser: null, isAuthenticated: false });
            } finally {
              set({ isLoading: false });
            }
          },

          refreshCurrentUser: async () => {
            const { strategy } = get();
            if (!strategy) return;

            try {
              const user = await strategy.getCurrentUser();
              set({ currentUser: user, isAuthenticated: !!user });
            } catch {
              set({ currentUser: null, isAuthenticated: false });
            }
          },

          syncCurrentUser: (user) => {
            set({ currentUser: user, isAuthenticated: !!user });
          },

          login: async (credentials) => {
            const { strategy } = get();
            if (!strategy) return;

            set({ isLoading: true });
            try {
              const user = await strategy.login(credentials);
              set({ currentUser: user, isAuthenticated: !!user });
            } finally {
              set({ isLoading: false });
            }
          },

          logout: async () => {
            const { strategy } = get();
            if (!strategy) return;

            try {
              await strategy.logout();
            } finally {
              set({ currentUser: null, isAuthenticated: false });
            }
          },

          register: async (data) => {
            const { strategy } = get();
            if (!strategy) return;

            set({ isLoading: true });
            try {
              const user = await strategy.register(data);
              set({ currentUser: user, isAuthenticated: !!user });
            } finally {
              set({ isLoading: false });
            }
          },

          acceptTerms: async () => {
            const { strategy, actions } = get();
            if (!strategy) return;

            set({ isLoading: true });
            try {
              await strategy.acceptTerms();
              await actions.refreshCurrentUser();
            } finally {
              set({ isLoading: false });
            }
          },

          selectUser: async (userId) => {
            const { strategy, actions } = get();
            if (!strategy) return;

            if (!strategy.selectUser) {
              throw new Error('selectUser not available for this auth strategy');
            }
            await strategy.selectUser(userId);
            await actions.refreshCurrentUser();
          },
        },
      };
    },
    {
      name: 'central-pet:auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Não persistimos ações, estratégia ou estado de carregamento
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
