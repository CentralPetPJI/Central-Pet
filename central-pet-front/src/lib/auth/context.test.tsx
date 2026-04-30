import { renderHook, waitFor, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './context';
import { useAuth } from './use-auth';

const { createAuthStrategyMock, strategyMock } = vi.hoisted(() => {
  const strategy = {
    type: 'mock' as const,
    initialize: vi.fn().mockResolvedValue(undefined),
    getCurrentUser: vi.fn().mockResolvedValue({
      id: 'user-1',
      fullName: 'ONG Patas do Centro',
      email: 'contato@patasdocentro.org',
      role: 'ONG',
      createdAt: '2026-04-01T00:00:00.000Z',
      updatedAt: '2026-04-01T00:00:00.000Z',
    }),
    login: vi.fn().mockResolvedValue({
      id: 'user-1',
      fullName: 'ONG Patas do Centro',
      email: 'contato@patasdocentro.org',
      role: 'ONG',
      createdAt: '2026-04-01T00:00:00.000Z',
      updatedAt: '2026-04-01T00:00:00.000Z',
    }),
    logout: vi.fn().mockResolvedValue(undefined),
    register: vi.fn().mockResolvedValue({
      id: 'user-1',
      fullName: 'ONG Patas do Centro',
      email: 'contato@patasdocentro.org',
      role: 'ONG',
      createdAt: '2026-04-01T00:00:00.000Z',
      updatedAt: '2026-04-01T00:00:00.000Z',
    }),
    getUsers: vi.fn().mockResolvedValue([
      {
        id: 'user-1',
        fullName: 'ONG Patas do Centro',
        email: 'contato@patasdocentro.org',
        role: 'ONG',
        createdAt: '2026-04-01T00:00:00.000Z',
        updatedAt: '2026-04-01T00:00:00.000Z',
      },
    ]),
    selectUser: vi.fn().mockResolvedValue({
      id: 'user-1',
      fullName: 'ONG Patas do Centro',
      email: 'contato@patasdocentro.org',
      role: 'ONG',
      createdAt: '2026-04-01T00:00:00.000Z',
      updatedAt: '2026-04-01T00:00:00.000Z',
    }),
  };

  return {
    strategyMock: strategy,
    createAuthStrategyMock: vi.fn(() => strategy),
  };
});

vi.mock('./strategies/factory', () => ({
  createAuthStrategy: createAuthStrategyMock,
}));

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inicializa a estrategia e expõe a sessao atual', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(createAuthStrategyMock).toHaveBeenCalledTimes(1);
    expect(strategyMock.initialize).toHaveBeenCalledTimes(1);
    expect(strategyMock.getUsers).toHaveBeenCalledTimes(1);
    expect(strategyMock.getCurrentUser).toHaveBeenCalledTimes(1);
    expect(result.current.currentUser?.id).toBe('user-1');
    expect(result.current.users).toHaveLength(1);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('encerra a sessao usando logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(strategyMock.logout).toHaveBeenCalledTimes(1);
    expect(result.current.currentUser).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('sincroniza o currentUser sem nova requisicao quando necessario', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.syncCurrentUser({
        id: 'user-1',
        fullName: 'ONG Patas do Centro',
        email: 'contato@patasdocentro.org',
        role: 'ONG',
        city: 'Campinas',
        state: 'SP',
        createdAt: '2026-04-01T00:00:00.000Z',
        updatedAt: '2026-04-02T00:00:00.000Z',
      });
    });

    expect(strategyMock.getCurrentUser).toHaveBeenCalledTimes(1);
    expect(result.current.currentUser?.city).toBe('Campinas');
    expect(result.current.currentUser?.state).toBe('SP');
  });
});
