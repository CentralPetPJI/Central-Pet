import type { Pet, PetApiResponse } from '@/Models/pet';
import {
  ensurePublicId,
  getBackendIdFromPublic,
  saveBatchPublicIdMappings,
} from './public-id-mapping';
import { formatPetSex, formatPetSize } from '@/lib/formatters';

/**
 * Sincroniza multiplos pets do backend em batch
 * Garante que todos recebam IDs publicos sem colisoes, mesmo entre multiplas abas
 */
export const ensureAllPublicIds = (apiPets: PetApiResponse[]): void => {
  const backendIds = apiPets.map((pet) => pet.id);
  saveBatchPublicIdMappings(backendIds);
};

/**
 * Converte PetApiResponse do backend para formato Pet do frontend
 * Usa IDs publicos sequenciais para URLs amigaveis
 */
export const mapApiResponseToPet = (apiPet: PetApiResponse): Pet => {
  const publicId = ensurePublicId(apiPet.id, apiPet.name);

  const personalityText =
    apiPet.selectedPersonalities.length > 0
      ? apiPet.selectedPersonalities.join(', ')
      : 'Perfil comportamental nao informado';

  const sex = formatPetSex(apiPet.sex) || 'Nao informado';
  const size = formatPetSize(apiPet.size) || 'Nao informado';
  const physicalText = [apiPet.breed, apiPet.age, sex, `porte ${size}`].filter(Boolean).join(', ');
  const locationText = apiPet.city
    ? `${apiPet.city}${apiPet.state ? `/${apiPet.state}` : ''}`
    : 'Localizacao nao informada';

  return {
    id: publicId,
    name: apiPet.name,
    species: apiPet.species,
    photo: apiPet.profilePhoto,
    city: apiPet.city || undefined,
    state: apiPet.state || undefined,
    physicalCharacteristics: physicalText,
    behavioralCharacteristics: personalityText,
    notes: `Localizacao: ${locationText}.`,
    responsibleUserId: apiPet.responsibleUserId,
    sourceType: apiPet.sourceType,
    sourceName: apiPet.sourceName,
  };
};

/**
 * Retorna o ID apropriado para navegacao/rotas
 * Sempre retorna o publicId (numero sequencial)
 */
export const getPetRouteId = (pet: Pet): number => {
  return typeof pet.id === 'number' ? pet.id : parseInt(String(pet.id), 10);
};

/**
 * Converte ID da rota (publicId) para backendId (UUID) se necessario
 */
export const resolveBackendId = (routeId: string | number): string | number => {
  const publicId = typeof routeId === 'string' ? parseInt(routeId, 10) : routeId;
  const backendId = getBackendIdFromPublic(publicId);

  return backendId ?? publicId;
};

/**
 * Verifica se o pet e do backend (tem mapeamento publico)
 */
export const isBackendPet = (pet: Pet): boolean => {
  if (typeof pet.id !== 'number') return false;
  return getBackendIdFromPublic(pet.id) !== undefined;
};
