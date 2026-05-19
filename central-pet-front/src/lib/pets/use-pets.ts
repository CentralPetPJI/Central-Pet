import { useCallback, useEffect, useMemo } from 'react';
import { usePetFeedStore } from '@/storage';
import type { Pet } from '@/Models/pet';
import type { PetFeedFilters } from '@/storage/pets/pet-feed-store';

export type UsePetsFilters = PetFeedFilters;

interface UsePetsResult {
  pets: Pet[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para buscar pets exclusivamente do backend.
 */
export const usePets = (filters?: UsePetsFilters): UsePetsResult => {
  const pets = usePetFeedStore((state) => state.pets);
  const isLoading = usePetFeedStore((state) => state.isLoading);
  const error = usePetFeedStore((state) => state.error);
  const actions = usePetFeedStore((state) => state.actions);

  const normalizedFilters = useMemo<UsePetsFilters>(
    () => ({
      responsibleUserId: filters?.responsibleUserId,
      adoptionStatus: filters?.adoptionStatus,
      state: filters?.state,
      species: filters?.species,
      sex: filters?.sex,
      size: filters?.size,
    }),
    [
      filters?.responsibleUserId,
      filters?.adoptionStatus,
      filters?.state,
      filters?.species,
      filters?.sex,
      filters?.size,
    ],
  );

  const fetchPets = useCallback(async () => {
    actions.setFilters(normalizedFilters);
    await actions.fetchPets();
  }, [actions, normalizedFilters]);

  useEffect(() => {
    void fetchPets();
  }, [fetchPets]);

  return {
    pets,
    isLoading,
    error,
    refetch: fetchPets,
  };
};
