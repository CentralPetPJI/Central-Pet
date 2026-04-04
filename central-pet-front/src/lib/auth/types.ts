/**
 * Auth Abstraction Layer - Type Definitions
 *
 * This module defines the contracts for the auth strategy pattern.
 * Current implementation uses mock auth for development and E2E tests.
 * JWT auth will be implemented in v1.1.
 */

// ============================================================================
// User Types
// ============================================================================

/**
 * Authenticated user data structure.
 * Matches the current auth-context.tsx AuthUser type exactly.
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
// Credential Types
// ============================================================================

/**
 * Credentials for login operation.
 * Used by JWT strategy; mock strategy uses selectMockUser instead.
 */
export type LoginCredentials = {
  email: string;
  password: string;
};

/**
 * Data for user registration.
 * Role-specific fields are conditionally required based on role value.
 */
export type RegisterData = {
  email: string;
  password: string;
  fullName: string;
  role: 'PESSOA_FISICA' | 'ONG';
  // Role-specific optional fields
  birthDate?: string;
  cpf?: string;
  organizationName?: string;
  cnpj?: string;
};

// ============================================================================
// Strategy Interface
// ============================================================================

/**
 * Auth Strategy Interface
 *
 * Defines the contract for all authentication strategies.
 * Each strategy implements the same interface but with different behavior:
 * - MockAuthStrategy: Uses mock users from backend, stored selection in localStorage
 * - JwtAuthStrategy: Real authentication with JWT tokens (v1.1)
 */
export interface AuthStrategy {
  /**
   * Strategy identifier.
   * Used to conditionally enable strategy-specific UI (e.g., mock user selector).
   */
  readonly type: 'mock' | 'jwt';

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  /**
   * Initialize the strategy.
   * Called once when AuthProvider mounts.
   * Mock: loads mock users from backend.
   * JWT: checks for existing session/token.
   */
  initialize(): Promise<void>;

  // -------------------------------------------------------------------------
  // Core Operations
  // -------------------------------------------------------------------------

  /**
   * Get the currently authenticated user.
   * Returns null if not authenticated.
   */
  getCurrentUser(): Promise<AuthUser | null>;

  /**
   * Authenticate with credentials.
   * Mock: throws (use selectMockUser instead).
   * JWT: POST /auth/login with credentials.
   */
  login(credentials: LoginCredentials): Promise<AuthUser>;

  /**
   * End the current session.
   * Mock: clears stored mock user ID.
   * JWT: POST /auth/logout to clear cookie.
   */
  logout(): Promise<void>;

  /**
   * Register a new user account.
   * Mock: throws (mock users come from backend).
   * JWT: POST /auth/register with user data.
   */
  register(data: RegisterData): Promise<AuthUser>;

  // -------------------------------------------------------------------------
  // Mock-Specific Methods (optional)
  // -------------------------------------------------------------------------

  /**
   * Get list of available mock users.
   * Only implemented by MockAuthStrategy.
   */
  getMockUsers?(): Promise<AuthUser[]>;

  /**
   * Select a mock user for the current session.
   * Only implemented by MockAuthStrategy.
   */
  selectMockUser?(userId: string): Promise<AuthUser>;
}

// ============================================================================
// Context Types
// ============================================================================

/**
 * Auth context value exposed to React components.
 * Provides access to current user state and auth operations.
 */
export type AuthContextValue = {
  currentUser: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  // Mock-specific (only available when using mock strategy)
  mockUsers: AuthUser[];
  selectMockUser: (userId: string) => Promise<void>;
  // Backwards compatibility alias (deprecated - use logout instead)
  clearAuth: () => Promise<void>;
};
