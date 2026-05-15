import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api';
import { usePets } from '@/lib/pets/use-pets';

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  api: {
    get: getMock,
  },
}));

const apiGetMock = vi.mocked(api.get);

describe('usePets', () => {
  beforeEach(() => {
    apiGetMock.mockReset();
    window.localStorage.clear();
  });

  it('envia os filtros informados para a API de pets', async () => {
    apiGetMock.mockImplementation((url: string) => {
      if (url === '/pets') {
        return Promise.resolve({
          data: {
            data: [],
          },
        });
      }

      return Promise.resolve({
        data: {
          data: [],
        },
      });
    });

    renderHook(() =>
      usePets({
        adoptionStatus: 'AVAILABLE',
        species: 'CAT',
        state: 'SP',
      }),
    );

    await waitFor(() => {
      expect(apiGetMock).toHaveBeenCalledWith('/pets', {
        params: {
          adoptionStatus: 'AVAILABLE',
          species: 'CAT',
          state: 'SP',
        },
      });
    });
  });
});
