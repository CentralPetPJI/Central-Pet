import { useCallback, useEffect, useState } from 'react';
import { api, apiBaseUrl } from '@/lib/api';

export const PET_STATS_CHANGED_BROWSER_EVENT = 'central-pet:pet-stats-changed';
const PET_STATS_CHANGED_SERVER_EVENT = 'pet-stats-changed';

export type PetStats = {
  availableBySpecies: Record<string, number>;
  adopted: number;
};

type UsePetStatsOptions = {
  enabled?: boolean;
};

interface UsePetStatsResult {
  stats: PetStats;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const emptyPetStats: PetStats = {
  availableBySpecies: {},
  adopted: 0,
};

const isDocumentVisible = () =>
  typeof document === 'undefined' || document.visibilityState === 'visible';

export const usePetStats = (options: UsePetStatsOptions = {}): UsePetStatsResult => {
  const { enabled = true } = options;
  const [stats, setStats] = useState<PetStats>(emptyPetStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isVisible, setIsVisible] = useState(isDocumentVisible);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: PetStats }>('/pets/stats');
      setStats(response.data.data);
    } catch (err) {
      setStats(emptyPetStats);
      setError(err instanceof Error ? err : new Error('Erro ao carregar estatísticas dos pets'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !isVisible) return;

    void fetchStats();
  }, [enabled, fetchStats, isVisible]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(isDocumentVisible());
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !isVisible || typeof EventSource === 'undefined') return;

    const source = new EventSource(`${apiBaseUrl}/pets/stats/events`, {
      withCredentials: true,
    });
    let isRefetching = false;

    const handleStatsChanged = () => {
      if (isRefetching) return;

      isRefetching = true;
      void fetchStats().finally(() => {
        isRefetching = false;
        window.dispatchEvent(new Event(PET_STATS_CHANGED_BROWSER_EVENT));
      });
    };

    source.addEventListener(PET_STATS_CHANGED_SERVER_EVENT, handleStatsChanged);

    return () => {
      source.removeEventListener(PET_STATS_CHANGED_SERVER_EVENT, handleStatsChanged);
      source.close();
    };
  }, [enabled, fetchStats, isVisible]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
};
