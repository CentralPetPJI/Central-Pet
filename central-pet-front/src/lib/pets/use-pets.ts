import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Pet, PetApiResponse } from '@/Models/pet';
import { getStoredPets } from '@/storage/pets';
import { mapApiResponseToPet } from '@/storage/pets/pet-helpers';

interface UsePetsResult {
  pets: Pet[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para buscar pets do backend e mesclar com localStorage
 * - Pets do backend recebem IDs públicos sequenciais (1, 2, 3...)
 * - Mapeamento publicId <-> UUID armazenado no localStorage
 * - URLs ficam amigáveis: /pets/1, /pets/2 ao invés de /pets/uuid-xxx
 */
export const usePets = (): UsePetsResult => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Busca pets do backend
      const response = await api.get<{ data: PetApiResponse[] }>('/pets');

      // Mapeia para Pet com IDs públicos
      const backendPets = response.data.data.map(mapApiResponseToPet);

      // Busca pets locais (ainda não sincronizados)
      const localPets = getStoredPets();

      // Mescla: pets do backend + pets locais únicos
      const backendPublicIds = new Set(backendPets.map((p) => p.id));
      const uniqueLocalPets = localPets.filter((localPet) => {
        return !backendPublicIds.has(localPet.id);
      });

      const mergedPets = [...backendPets, ...uniqueLocalPets];
      setPets(mergedPets);
    } catch (err) {
      // Em caso de erro (backend offline), usa apenas localStorage
      const localPets = getStoredPets();
      setPets(localPets);
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
