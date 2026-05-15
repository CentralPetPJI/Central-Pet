import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api';
import { usePetStats } from './use-pet-stats';

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  api: {
    get: getMock,
  },
}));

const apiGetMock = vi.mocked(api.get);

describe('usePetStats', () => {
  beforeEach(() => {
    apiGetMock.mockReset();
  });

  it('carrega estatísticas dos pets', async () => {
    apiGetMock.mockResolvedValue({
      data: {
        data: {
          availableBySpecies: {
            dog: 3,
            cat: 2,
          },
          adopted: 5,
        },
      },
    });

    const { result } = renderHook(() => usePetStats());

    await waitFor(() => {
      expect(result.current.stats).toEqual({
        availableBySpecies: {
          dog: 3,
          cat: 2,
        },
        adopted: 5,
      });
    });

    expect(apiGetMock).toHaveBeenCalledWith('/pets/stats');
  });
});
