import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from './context';
import { useAuth } from './use-auth';
import { AuthContextValue } from '@/Models';

const authValue: AuthContextValue = {
  currentUser: {
    id: 'user-1',
    fullName: 'ONG Patas do Centro',
    email: 'contato@patasdocentro.org',
    role: 'ONG',
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
    acceptedTermsAt: '2026-04-01T00:00:00.000Z',
  },
  isLoading: false,
  isAuthenticated: true,
  acceptTerms: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  users: [],
  selectUser: vi.fn(),
};

function createWrapper(value: AuthContextValue) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  };
}

describe('hook useAuth', () => {
  it('retorna o valor do contexto dentro do provider', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(authValue),
    });

    expect(result.current.currentUser?.id).toBe('user-1');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('lanca erro quando usado fora do provider', () => {
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within AuthProvider');
  });
});
