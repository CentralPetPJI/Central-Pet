/**
 * useAuth Hook
 *
 * Provides access to auth state and actions from the AuthContext.
 */

import { useContext } from 'react';
import { AuthContext } from './context';
import type { AuthContextValue } from './types';

/**
 * Hook to access auth state and actions.
 *
 * @returns Auth context with:
 * - currentUser: Current authenticated user (null if not authenticated)
 * - isLoading: Whether auth state is being loaded
 * - isAuthenticated: Boolean shorthand for currentUser !== null
 * - login(credentials): Authenticate with email/password (JWT strategy)
 * - logout(): Clear current session
 * - register(data): Create new account (JWT strategy)
 * - mockUsers: Available mock users (mock strategy only)
 * - selectMockUser(userId): Select a mock user (mock strategy only)
 * - clearAuth(): Deprecated alias for logout()
 *
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
