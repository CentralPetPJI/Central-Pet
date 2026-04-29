import type { Pet, PetApiResponse } from '@/Models/pet';
import {
  ensurePublicId,
  getBackendIdFromPublic,
  saveBatchPublicIdMappings,
} from './public-id-mapping';
import { formatPetSex, formatPetSize } from '@/lib/formatters';
import { formatPetAge } from '@/lib/pet-age';

/**
 * Sincroniza múltiplos pets do backend em batch
 * Garante que todos recebam IDs públicos sem colisões, mesmo entre múltiplas abas
 */
export const ensureAllPublicIds = (apiPets: PetApiResponse[]): void => {
  const backendIds = apiPets.map((pet) => pet.id);
  saveBatchPublicIdMappings(backendIds);
};

/**
 * Converte PetApiResponse do backend para formato Pet do frontend
 * Usa IDs públicos sequenciais para URLs amigáveis
 */
export const mapApiResponseToPet = (apiPet: PetApiResponse): Pet => {
  // Garante que o pet do backend tenha um publicId
  const publicId = ensurePublicId(apiPet.id, apiPet.name);

  const personalityText =
    apiPet.selectedPersonalities.length > 0
      ? apiPet.selectedPersonalities.join(', ')
      : 'Perfil comportamental não informado';

  const sex = formatPetSex(apiPet.sex) || 'Não informado';
  const size = formatPetSize(apiPet.size) || 'Não informado';

  const physicalText = [apiPet.breed, formatPetAge(apiPet.age), sex, `porte ${size}`]
    .filter(Boolean)
    .join(', ');

  const notesText = `Tutor: ${apiPet.tutor || apiPet.shelter || 'Não informado'}. Cidade: ${apiPet.city}${apiPet.state ? `/${apiPet.state}` : ''}. Contato: ${apiPet.contact}.`;

  return {
    id: publicId, // ID público sequencial (1, 2, 3...)
    name: apiPet.name,
    species: apiPet.species,
    photo: apiPet.profilePhoto,
    physicalCharacteristics: physicalText,
    behavioralCharacteristics: personalityText,
    notes: notesText,
    responsibleUserId: apiPet.responsibleUserId,
    sourceType: apiPet.sourceType,
    sourceName: apiPet.sourceName,
  };
};

/**
 * Retorna o ID apropriado para navegação/rotas
 * Sempre retorna o publicId (número sequencial)
 */
export const getPetRouteId = (pet: Pet): number => {
  // Pet já tem publicId
  return typeof pet.id === 'number' ? pet.id : parseInt(String(pet.id), 10);
};

/**
 * Converte ID da rota (publicId) para backendId (UUID) se necessário
 */
export const resolveBackendId = (routeId: string | number): string | number => {
  const publicId = typeof routeId === 'string' ? parseInt(routeId, 10) : routeId;

  // Tenta buscar UUID do backend
  const backendId = getBackendIdFromPublic(publicId);

  // Se encontrou mapeamento, retorna UUID; senão retorna o próprio ID
  return backendId ?? publicId;
};

/**
 * Verifica se o pet é do backend (tem mapeamento público)
 */
export const isBackendPet = (pet: Pet): boolean => {
  if (typeof pet.id !== 'number') return false;
  return getBackendIdFromPublic(pet.id) !== undefined;
};
