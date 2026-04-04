export const userStorageKey = 'central-pet:user-id';

export function getStoredUserId(): string | null {
  return window.localStorage.getItem(userStorageKey);
}

export function setStoredUserId(userId: string): void {
  window.localStorage.setItem(userStorageKey, userId);
}

export function clearStoredUserId(): void {
  window.localStorage.removeItem(userStorageKey);
}
