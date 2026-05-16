import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api';
import { PET_STATS_CHANGED_BROWSER_EVENT, usePetStats } from './use-pet-stats';

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  apiBaseUrl: 'http://localhost:3000/api',
  api: {
    get: getMock,
  },
}));

const apiGetMock = vi.mocked(api.get);

class MockEventSource {
  static instances: MockEventSource[] = [];

  readonly url: string;
  readonly options?: EventSourceInit;
  readonly listeners = new Map<string, EventListener>();
  readonly addEventListener = vi.fn((type: string, listener: EventListener) => {
    this.listeners.set(type, listener);
  });
  readonly removeEventListener = vi.fn((type: string) => {
    this.listeners.delete(type);
  });
  readonly close = vi.fn();

  constructor(url: string, options?: EventSourceInit) {
    this.url = url;
    this.options = options;
    MockEventSource.instances.push(this);
  }

  emit(type: string) {
    this.listeners.get(type)?.(new MessageEvent(type));
  }
}

describe('usePetStats', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    apiGetMock.mockReset();
    MockEventSource.instances = [];
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

  it('refaz estatísticas e notifica a home ao receber evento SSE', async () => {
    vi.stubGlobal('EventSource', MockEventSource);
    const localEventListener = vi.fn();
    window.addEventListener(PET_STATS_CHANGED_BROWSER_EVENT, localEventListener);

    apiGetMock
      .mockResolvedValueOnce({
        data: {
          data: {
            availableBySpecies: {
              dog: 1,
              cat: 0,
            },
            adopted: 0,
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            availableBySpecies: {
              dog: 2,
              cat: 0,
            },
            adopted: 0,
          },
        },
      });

    const { result, unmount } = renderHook(() => usePetStats());

    await waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1);
    });

    MockEventSource.instances[0]?.emit('pet-stats-changed');

    await waitFor(() => {
      expect(result.current.stats.availableBySpecies.dog).toBe(2);
      expect(localEventListener).toHaveBeenCalledTimes(1);
    });

    expect(MockEventSource.instances[0]?.url).toBe('http://localhost:3000/api/pets/stats/events');
    expect(MockEventSource.instances[0]?.options).toEqual({ withCredentials: true });

    unmount();

    expect(MockEventSource.instances[0]?.close).toHaveBeenCalledTimes(1);
    window.removeEventListener(PET_STATS_CHANGED_BROWSER_EVENT, localEventListener);
  });
});
