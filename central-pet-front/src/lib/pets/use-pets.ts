import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Pet, PetApiResponse } from '@/Models/pet';
import { mapApiResponseToPet, ensureAllPublicIds } from '@/storage/pets/pet-helpers';

export type UsePetsFilters = {
  responsibleUserId?: string;
  adoptionStatus?: 'AVAILABLE' | 'ADOPTED' | 'UNAVAILABLE';
  state?: string;
  species?: 'DOG' | 'CAT';
  sex?: 'MALE' | 'FEMALE';
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';
};

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
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: PetApiResponse[] }>('/pets', {
        params: filters,
      });

      ensureAllPublicIds(response.data.data);
      const backendPets = response.data.data.map(mapApiResponseToPet);
      setPets(backendPets);
    } catch (err) {
      setPets([]);
      setError(err instanceof Error ? err : new Error('Erro ao carregar pets'));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

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
