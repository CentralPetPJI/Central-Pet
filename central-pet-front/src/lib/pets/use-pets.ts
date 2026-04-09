import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Pet, PetApiResponse } from '@/Models/pet';
import { mapApiResponseToPet, ensureAllPublicIds } from '@/storage/pets/pet-helpers';

interface UsePetsResult {
  pets: Pet[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para buscar pets exclusivamente do backend.
 */
export const usePets = (): UsePetsResult => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: PetApiResponse[] }>('/pets');

      ensureAllPublicIds(response.data.data);
      const backendPets = response.data.data.map(mapApiResponseToPet);
      setPets(backendPets);
    } catch (err) {
      setPets([]);
      setError(err instanceof Error ? err : new Error('Erro ao carregar pets'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchPets();
  }, []);

  return {
    pets,
    isLoading,
    error,
    refetch: fetchPets,
  };
};
