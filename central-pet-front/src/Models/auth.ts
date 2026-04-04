/**
 * Camada de abstração de autenticação - Definições de tipos
 *
 * Este módulo define os contratos para o padrão de estratégia de autenticação.
 * A implementação atual usa autenticação mock para desenvolvimento e testes E2E.
 * A autenticação JWT será implementada na v1.1.
 */

/**
 * Estrutura de dados do usuário autenticado.
 * Corresponde exatamente ao tipo AuthUser atual de auth-context.tsx.
 */
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

// ============================================================================
// Tipos de credenciais
// ============================================================================

/**
 * Credenciais para operação de login.
 * Usadas pela estratégia JWT; a estratégia mock usa selectUser.
 */
export type LoginCredentials = {
  email: string;
  password: string;
};

/**
 * Dados para cadastro de usuário.
 * Campos específicos por perfil são exigidos condicionalmente com base no valor de role.
 */
export type RegisterData = {
  email: string;
  password: string;
  fullName: string;
  role: 'PESSOA_FISICA' | 'ONG';
  // Campos opcionais específicos por perfil
  birthDate?: string;
  cpf?: string;
  organizationName?: string;
  cnpj?: string;
};

// ============================================================================
// Interface da estratégia
// ============================================================================

/**
 * Interface de estratégia de autenticação
 *
 * Define o contrato para todas as estratégias de autenticação.
 * Cada estratégia implementa a mesma interface, mas com comportamentos diferentes:
 * - MockAuthStrategy: usa usuários mock do backend e salva seleção no localStorage
 * - JwtAuthStrategy: autenticação real com tokens JWT (v1.1)
 */
export interface AuthStrategy {
  /**
   * Identificador da estratégia.
   * Usado para habilitar condicionalmente interfaces específicas (ex.: seletor de usuário mock).
   */
  readonly type: 'mock' | 'jwt';

  // -------------------------------------------------------------------------
  // Ciclo de vida
  // -------------------------------------------------------------------------

  /**
   * Inicializa a estratégia.
   * É chamado uma vez quando o AuthProvider é montado.
   * Mock: carrega usuários mock do backend.
   * JWT: verifica sessão/token existente.
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
   * JWT: POST /auth/login com credenciais.
   */
  login(credentials: LoginCredentials): Promise<AuthUser>;

  /**
   * Encerra a sessão atual.
   * Mock: remove o ID de usuário mock salvo.
   * JWT: POST /auth/logout para limpar o cookie.
   */
  logout(): Promise<void>;

  /**
   * Cadastra uma nova conta de usuário.
   * Mock: lança erro (usuários mock vêm do backend).
   * JWT: POST /auth/register com os dados do usuário.
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
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  users: AuthUser[];
  selectUser: (userId: string) => Promise<void>;
};
