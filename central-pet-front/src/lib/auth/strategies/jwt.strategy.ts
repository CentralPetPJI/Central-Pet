/**
 * Estratégia de autenticação JWT
 *
 * Implementa autenticação usando sessões com cookies httpOnly.
 * O backend gerencia as sessões e retorna cookies seguros.
 */

import { api } from '@/lib/api';
import type { AuthStrategy, AuthUser, LoginCredentials, RegisterData } from '@/Models';

type LoginResponse = {
  message: string;
  data: {
    user: AuthUser;
  };
};

type GetUserResponse = {
  message: string;
  data: {
    user: AuthUser;
  };
};

type CreateUserResponse = {
  message: string;
  data: AuthUser;
};

/**
 * Estratégia de autenticação JWT com cookies httpOnly.
 *
 * Utiliza cookies httpOnly gerenciados pelo backend para segurança contra XSS.
 * O token nunca fica exposto no JavaScript do cliente.
 */
export class JwtAuthStrategy implements AuthStrategy {
  readonly type = 'jwt' as const;

  /**
   * Inicializa a autenticação JWT.
   * Não precisa fazer nada pois o cookie é gerenciado automaticamente.
   */
  async initialize(): Promise<void> {
    // Cookie httpOnly é enviado automaticamente com requisições
    // Não há necessidade de configuração adicional
  }

  /**
   * Obtém o usuário atual a partir da sessão do cookie.
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      console.log("getting user")
      const response = await api.get<GetUserResponse>('/auth/me');
      return response.data.data.user;
    } catch (_error) {
      // Se não estiver autenticado ou sessão expirou, retorna null
      console.error("error getting user", _error)
      return null;
    }
  }

  /**
   * Faz login com credenciais de email/senha.
   * O backend retorna um cookie httpOnly com o sessionId.
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await api.post<LoginResponse>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });

    return response.data.data.user;
  }

  /**
   * Encerra a sessão (logout).
   * O backend limpa o cookie httpOnly.
   */
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  }

  /**
   * Registra uma nova conta de usuário.
   * Após criar, faz auto-login com as mesmas credenciais.
   */
  async register(data: RegisterData): Promise<AuthUser> {
    // Cria o usuário
    await api.post<CreateUserResponse>('/users', {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      role: data.role,
      birthDate: data.birthDate,
      cpf: data.cpf,
      organizationName: data.organizationName,
      cnpj: data.cnpj,
    });

    // Faz auto-login após criar a conta
    return this.login({
      email: data.email,
      password: data.password,
    });
  }
}
