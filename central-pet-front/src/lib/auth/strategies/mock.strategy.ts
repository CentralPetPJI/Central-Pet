import { api } from '../../api';
import { isDevelopment } from '../../dev-mode';
import { clearStoredUserId, getStoredUserId, setStoredUserId } from '@/storage/auth';
import type { AuthStrategy, AuthUser, LoginCredentials, RegisterData } from '@/Models';

type UsersResponse = {
  data: {
    users: AuthUser[];
    defaultUserId: string;
  };
};

type SelectUserResponse = {
  data: {
    user: AuthUser;
  };
};

/**
 * Estratégia de autenticação mock.
 *
 * Usada em desenvolvimento e testes E2E, quando autenticação real não é necessária.
 * Os usuários mock são carregados do backend e armazenados no localStorage.
 */
export class MockAuthStrategy implements AuthStrategy {
  readonly type = 'mock' as const;

  private users: AuthUser[] = [];

  /**
   * Inicializa a autenticação mock carregando os usuários disponíveis do backend.
   * Seleciona automaticamente o usuário padrão em desenvolvimento se não houver um salvo.
   */
  async initialize(): Promise<void> {
    const response = await api.get<UsersResponse>('/mock-auth/mock-users');
    const { defaultUserId, users } = response.data.data;

    this.users = users;

    // Verifica se o usuário salvo ainda existe na lista de usuários mock
    const storedId = getStoredUserId();
    const hasStoredUser = storedId ? users.some((u) => u.id === storedId) : false;

    // Remove ID de usuário salvo inválido
    if (!hasStoredUser && storedId) {
      clearStoredUserId();
    }

    let selectedUserId: string | null = hasStoredUser ? (storedId ?? null) : null;

    // Seleciona automaticamente o usuário padrão em desenvolvimento se não houver um salvo
    if (!selectedUserId && isDevelopment()) {
      selectedUserId = defaultUserId;
      setStoredUserId(defaultUserId);
    }

    if (selectedUserId) {
      await this.activateMockSession(selectedUserId);
    }
  }

  /**
   * Obtém o usuário atual do endpoint /mock-auth/me.
   * Retorna null se não estiver autenticado (nenhum usuário mock selecionado).
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const response = await api.get<{ data: { user: AuthUser } }>('/mock-auth/me');
      return response.data.data.user;
    } catch {
      return null;
    }
  }

  /**
   * Login não é suportado na estratégia mock.
   * Use selectUser no lugar.
   */
  async login(_credentials: LoginCredentials): Promise<AuthUser> {
    throw new Error('Mock auth does not support login. Use selectUser instead.');
  }

  /**
   * O logout remove o ID do usuário mock salvo.
   */
  async logout(): Promise<void> {
    await api.post('/auth/logout');
    clearStoredUserId();
  }

  /**
   * Cadastro não é suportado na estratégia mock.
   * Os usuários mock são definidos no backend.
   */
  async register(_data: RegisterData): Promise<AuthUser> {
    throw new Error('Mock auth does not support registration.');
  }

  /**
   * Retorna a lista de usuários disponíveis.
   */
  async getUsers(): Promise<AuthUser[]> {
    return this.users;
  }

  /**
   * Seleciona um usuário para a sessão atual.
   * Armazena o ID do usuário no localStorage.
   */
  async selectUser(userId: string): Promise<AuthUser> {
    const user = this.users.find((u) => u.id === userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    await this.activateMockSession(userId);
    setStoredUserId(userId);
    return user;
  }

  /**
   * Ativa o modo mock e cria sessão mock no cookie da aplicação.
   */
  private async activateMockSession(userId: string): Promise<void> {
    await api.post('/auth/mode', { mode: 'mock' });
    await api.post<SelectUserResponse>('/mock-auth/select-user', { userId });
  }
}
