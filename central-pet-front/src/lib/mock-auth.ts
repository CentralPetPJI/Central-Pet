import type { AuthUser } from './auth-context';

export const mockUserStorageKey = 'central-pet:mock-user-id';

export type MockUsersResponse = {
  data: {
    users: AuthUser[];
    defaultUserId: string;
  };
};

export function getStoredMockUserId() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(mockUserStorageKey);
}

export function setStoredMockUserId(userId: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(mockUserStorageKey, userId);
}
