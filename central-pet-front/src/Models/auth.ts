/**
 * Interface para estratégias de autenticação.
 *
 * Atualmente suporta dois tipos:
 * - MockAuthStrategy: autenticação mock para desenvolvimento e testes.
 * - SessionAuthStrategy: autenticação por sessão com cookies httpOnly.
 */

// Tipos bases são definidos no topo do arquivo para evitar dependência circular
export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: 'PESSOA_FISICA' | 'ONG' | 'ADMIN' | 'ROOT';
  birthDate?: string;
  cpf?: string;
  organizationName?: string;
  cnpj?: string;
  city?: string;
  state?: string;
  phone?: string;
  mobile?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  foundedAt?: string;
  createdAt: string;
  updatedAt: string;
  mustChangePassword?: boolean;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  fullName: string;
  email: string;
  password: string;
  role: 'PESSOA_FISICA' | 'ONG' | 'ADMIN' | 'ROOT';
  birthDate?: string;
  cpf?: string;
  organizationName?: string;
  cnpj?: string;
};

export interface AuthStrategy {
  /**
   * Identificador da estratégia.
   * Usado para habilitar condicionalmente interfaces específicas (ex.: seletor de usuário mock).
   */
  readonly type: 'mock' | 'session';

  // -------------------------------------------------------------------------
  // Ciclo de vida
  // -------------------------------------------------------------------------

  /**
   * Inicializa a estratégia.
   * É chamado uma vez quando o AuthProvider é montado.
   * Mock: carrega usuários mock do backend.
   * Session: verifica sessão existente.
   */
  initialize(): Promise<void>;

  // -------------------------------------------------------------------------
  // Operações principais
  // -------------------------------------------------------------------------

  /**
   * Obtém o usuário atualmente autenticado.
   * Retorna null se não estiver autenticado.
   */
  getCurrentUser(): Promise<AuthUser | null>;

  /**
   * Autentica com credenciais.
   * Mock: lança erro (use selectUser).
   * Session: POST /auth/login com credenciais.
   */
  login(credentials: LoginCredentials): Promise<AuthUser>;

  /**
   * Encerra a sessão atual.
   * Mock: remove o ID de usuário mock salvo.
   * Session: POST /auth/logout para limpar o cookie.
   */
  logout(): Promise<void>;

  /**
   * Cadastra uma nova conta de usuário.
   * Mock: lança erro (usuários mock vêm do backend).
   * Session: POST /users com os dados do usuário.
   */
  register(data: RegisterData): Promise<AuthUser>;

  // -------------------------------------------------------------------------
  // Métodos específicos do modo mock (opcionais)
  // -------------------------------------------------------------------------

  /**
   * Retorna a lista de usuários mock disponíveis.
   * Implementado apenas por MockAuthStrategy.
   */
  getUsers?(): Promise<AuthUser[]>;

  /**
   * Seleciona um usuário mock para a sessão atual.
   * Implementado apenas por MockAuthStrategy.
   */
  selectUser?(userId: string): Promise<AuthUser>;
}

// ============================================================================
// Tipos de contexto
// ============================================================================

/**
 * Valor do contexto de autenticação exposto aos componentes React.
 * Fornece acesso ao estado do usuário atual e às operações de autenticação.
 */
export type AuthContextValue = {
  currentUser: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: (redirectTo?: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  users: AuthUser[];
  selectUser: (userId: string) => Promise<void>;
};
