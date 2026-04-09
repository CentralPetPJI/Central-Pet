import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../api';
import { userStorageKey } from '@/storage/auth';
import { MockAuthStrategy } from './mock.strategy';

const { isDevelopmentMock } = vi.hoisted(() => ({
  isDevelopmentMock: vi.fn(),
}));

vi.mock('../../api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../../dev-mode', () => ({
  isDevelopment: isDevelopmentMock,
}));

const apiGetMock = vi.mocked(api.get);
const apiPostMock = vi.mocked(api.post);

describe('Estrategia MockAuthStrategy', () => {
  beforeEach(() => {
    window.localStorage.clear();
    apiGetMock.mockReset();
    apiPostMock.mockReset();
    isDevelopmentMock.mockReset();
  });

  it('carrega usuarios mock e seleciona automaticamente o usuario padrao em desenvolvimento', async () => {
    isDevelopmentMock.mockReturnValue(true);
    apiGetMock.mockResolvedValueOnce({
      data: {
        data: {
          users: [
            {
              id: 'mock-user-1',
              fullName: 'ONG Patas do Centro',
              email: 'contato@patasdocentro.org',
              role: 'ONG',
              createdAt: '2026-04-01T00:00:00.000Z',
              updatedAt: '2026-04-01T00:00:00.000Z',
            },
          ],
          defaultUserId: 'mock-user-1',
        },
      },
    });

    const strategy = new MockAuthStrategy();
    apiPostMock.mockResolvedValue({});
    await strategy.initialize();

    expect(window.localStorage.getItem(userStorageKey)).toBe('mock-user-1');
    expect(apiPostMock).toHaveBeenNthCalledWith(1, '/auth/mode', { mode: 'mock' });
    expect(apiPostMock).toHaveBeenNthCalledWith(2, '/mock-auth/select-user', {
      userId: 'mock-user-1',
    });
    await expect(strategy.getUsers()).resolves.toHaveLength(1);
  });

  it('retorna o usuario atual e limpa o usuario no logout', async () => {
    apiGetMock.mockResolvedValueOnce({
      data: {
        data: {
          user: {
            id: 'mock-user-2',
            fullName: 'Rafael Lima',
            email: 'rafael.lima@email.com',
            role: 'PESSOA_FISICA',
            createdAt: '2026-04-01T00:00:00.000Z',
            updatedAt: '2026-04-01T00:00:00.000Z',
          },
        },
      },
    });

    const strategy = new MockAuthStrategy();
    apiPostMock.mockResolvedValue({});

    window.localStorage.setItem(userStorageKey, 'mock-user-2');

    await expect(strategy.getCurrentUser()).resolves.toMatchObject({
      id: 'mock-user-2',
      fullName: 'Rafael Lima',
    });

    await strategy.logout();

    expect(apiPostMock).toHaveBeenCalledWith('/auth/logout');
    expect(window.localStorage.getItem(userStorageKey)).toBeNull();
  });

  it('seleciona um usuario e rejeita operacoes de login e cadastro nao suportadas', async () => {
    isDevelopmentMock.mockReturnValue(false);
    apiGetMock.mockResolvedValueOnce({
      data: {
        data: {
          users: [
            {
              id: 'mock-user-3',
              fullName: 'Ana Souza',
              email: 'ana.souza@email.com',
              role: 'PESSOA_FISICA',
              createdAt: '2026-04-01T00:00:00.000Z',
              updatedAt: '2026-04-01T00:00:00.000Z',
            },
          ],
          defaultUserId: 'mock-user-3',
        },
      },
    });

    const strategy = new MockAuthStrategy();
    apiPostMock.mockResolvedValue({});
    await strategy.initialize();

    await expect(strategy.selectUser('mock-user-3')).resolves.toMatchObject({
      id: 'mock-user-3',
    });
    expect(apiPostMock).toHaveBeenNthCalledWith(1, '/auth/mode', { mode: 'mock' });
    expect(apiPostMock).toHaveBeenNthCalledWith(2, '/mock-auth/select-user', {
      userId: 'mock-user-3',
    });
    expect(window.localStorage.getItem(userStorageKey)).toBe('mock-user-3');

    await expect(strategy.login({ email: 'test@example.com', password: 'secret' })).rejects.toThrow(
      'Mock auth does not support login. Use selectUser instead.',
    );
    await expect(
      strategy.register({
        email: 'test@example.com',
        password: 'secret',
        fullName: 'Test',
        role: 'ONG',
      }),
    ).rejects.toThrow('Mock auth does not support registration.');
  });
});
