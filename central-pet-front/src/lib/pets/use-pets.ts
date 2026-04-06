import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Pet, PetApiResponse } from '@/Models/pet';
import { getStoredPets } from '@/storage/pets';
import { mapApiResponseToPet, ensureAllPublicIds } from '@/storage/pets/pet-helpers';
import { initializeCounterWithLocalPets } from '@/storage/pets/public-id-mapping';

interface UsePetsResult {
  pets: Pet[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para buscar pets do backend e mesclar com localStorage
 * - Pets do backend recebem IDs públicos sequenciais após os locais
 * - Mapeamento publicId <-> UUID armazenado no localStorage
 * - URLs ficam amigáveis: /pets/1, /pets/2 ao invés de /pets/uuid-xxx
 * - Sem estado global: IDs calculados dinamicamente a partir do localStorage
 */
export const usePets = (): UsePetsResult => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Busca pets locais primeiro para inicializar contadores
      const localPets = getStoredPets();
      const localPetIds = localPets.map((p) => p.id);

      // Inicializa contadores considerando IDs locais
      // Garante que backend receberá IDs após os locais
      initializeCounterWithLocalPets(localPetIds);

      // Busca pets do backend
      const response = await api.get<{ data: PetApiResponse[] }>('/pets');

      // Sincroniza todos os IDs do backend em batch para evitar colisões
      ensureAllPublicIds(response.data.data);

      // Mapeia para Pet com IDs públicos
      const backendPets = response.data.data.map(mapApiResponseToPet);

      // Mescla: pets do backend + pets locais únicos (não sincronizados)
      // Um pet local está sincronizado se tem um backendId no mapeamento
      const backendPublicIds = new Set(backendPets.map((p) => p.id));
      const uniqueLocalPets = localPets.filter((localPet) => {
        // Se o pet local tem o mesmo publicId que um pet do backend,
        // significa que foi sincronizado - não incluir
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
