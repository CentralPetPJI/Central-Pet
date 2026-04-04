/**
 * Mock Authentication Strategy
 *
 * Implements AuthStrategy for development and E2E testing.
 * Uses mock users from backend, stores selected user ID in localStorage.
 */

import { api } from '../../api';
import { clearStoredMockUserId, getStoredMockUserId, setStoredMockUserId } from '../../mock-auth';
import { isDevelopment } from '../../dev-mode';
import type { AuthStrategy, AuthUser, LoginCredentials, RegisterData } from '../types';

/**
 * Response structure from /auth/mock-users endpoint.
 */
type MockUsersResponse = {
  data: {
    users: AuthUser[];
    defaultUserId: string;
  };
};

/**
 * Mock authentication strategy.
 *
 * Used for development and E2E tests where real authentication is not needed.
 * Mock users are loaded from the backend and stored in localStorage.
 */
export class MockAuthStrategy implements AuthStrategy {
  readonly type = 'mock' as const;

  private mockUsers: AuthUser[] = [];

  /**
   * Initialize mock auth by loading available mock users from backend.
   * Auto-selects default user in development if none stored.
   */
  async initialize(): Promise<void> {
    const response = await api.get<MockUsersResponse>('/auth/mock-users');
    const { defaultUserId, users } = response.data.data;

    this.mockUsers = users;

    // Check if stored user still exists in mock users list
    const storedId = getStoredMockUserId();
    const hasStoredUser = storedId ? users.some((u) => u.id === storedId) : false;

    // Clear invalid stored user ID
    if (!hasStoredUser && storedId) {
      clearStoredMockUserId();
    }

    // Auto-select default user in development if none stored
    if (!hasStoredUser && !storedId && isDevelopment()) {
      setStoredMockUserId(defaultUserId);
    }
  }

  /**
   * Get current user from /auth/me endpoint.
   * Returns null if not authenticated (no mock user selected).
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const response = await api.get<{ data: { user: AuthUser } }>('/auth/me');
      return response.data.data.user;
    } catch {
      return null;
    }
  }

  /**
   * Login is not supported in mock strategy.
   * Use selectMockUser instead.
   */
  async login(_credentials: LoginCredentials): Promise<AuthUser> {
    throw new Error('Mock auth does not support login. Use selectMockUser instead.');
  }

  /**
   * Logout clears the stored mock user ID.
   */
  async logout(): Promise<void> {
    clearStoredMockUserId();
  }

  /**
   * Registration is not supported in mock strategy.
   * Mock users are defined in backend.
   */
  async register(_data: RegisterData): Promise<AuthUser> {
    throw new Error('Mock auth does not support registration.');
  }

  // -------------------------------------------------------------------------
  // Mock-Specific Methods
  // -------------------------------------------------------------------------

  /**
   * Get the list of available mock users.
   */
  async getMockUsers(): Promise<AuthUser[]> {
    return this.mockUsers;
  }

  /**
   * Select a mock user for the current session.
   * Stores the user ID in localStorage.
   */
  async selectMockUser(userId: string): Promise<AuthUser> {
    const user = this.mockUsers.find((u) => u.id === userId);
    if (!user) {
      throw new Error(`Mock user not found: ${userId}`);
    }
    setStoredMockUserId(userId);
    return user;
  }
}
