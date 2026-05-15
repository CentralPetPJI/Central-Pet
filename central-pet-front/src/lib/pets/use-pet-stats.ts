import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

export type PetStats = {
  availableBySpecies: Record<string, number>;
  adopted: number;
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

export const usePetStats = (): UsePetStatsResult => {
  const [stats, setStats] = useState<PetStats>(emptyPetStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
    void fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
};
