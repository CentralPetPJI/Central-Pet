import { describe, expect, it, beforeEach } from 'vitest';
import {
  clearStoredUserId,
  getStoredUserId,
  setStoredUserId,
  userStorageKey,
} from '@/storage/auth';

describe('auxiliares de armazenamento de usuario', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('retorna null quando nenhum usuario esta salvo', () => {
    expect(getStoredUserId()).toBeNull();
  });

  it('persiste e limpa o id de usuario salvo', () => {
    setStoredUserId('user-123');

    expect(window.localStorage.getItem(userStorageKey)).toBe('user-123');
    expect(getStoredUserId()).toBe('user-123');

    clearStoredUserId();

    expect(getStoredUserId()).toBeNull();
  });
});
