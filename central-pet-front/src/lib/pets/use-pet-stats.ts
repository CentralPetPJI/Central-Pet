import { useEffect } from 'react';
import {
  PET_STATS_CHANGED_BROWSER_EVENT,
  usePetStatsStore,
  type PetStats,
} from '@/storage/pets/pet-stats-store';

type UsePetStatsOptions = {
  enabled?: boolean;
};

interface UsePetStatsResult {
  stats: PetStats;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const usePetStats = (options: UsePetStatsOptions = {}): UsePetStatsResult => {
  const { enabled = true } = options;
  const { stats, isLoading, error, actions } = usePetStatsStore();

  useEffect(() => {
    if (!enabled) return;

    void actions.fetchStats();
    actions.startListening();

    return () => {
      actions.stopListening();
    };
  }, [enabled, actions]);

  return {
    stats,
    isLoading,
    error,
    refetch: actions.fetchStats,
  };
};

export { PET_STATS_CHANGED_BROWSER_EVENT };
export type { PetStats };
