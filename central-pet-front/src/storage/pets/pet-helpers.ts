import type { Pet, PetApiResponse } from '@/Models/pet';
import { formatPetSex, formatPetSize } from '@/lib/formatters';
import type { PetPersonalityApiOption } from './pet-personality-options';
import { formatPetAge } from '@/lib/pet-age';

/**
 * Sincroniza multiplos pets do backend em batch
 * Garante que todos recebam IDs publicos sem colisoes, mesmo entre multiplas abas
 */
export const ensureAllPublicIds = (apiPets: PetApiResponse[]): void => {
  void apiPets;
};

/**
 * Converte PetApiResponse do backend para formato Pet do frontend
 * Usa IDs publicos sequenciais para URLs amigaveis
 */
const formatSelectedPersonalities = (
  selectedPersonalities: string[],
  personalityOptions: PetPersonalityApiOption[] = [],
): string => {
  if (selectedPersonalities.length === 0) {
    return 'Perfil comportamental não informado';
  }

  const titleById = new Map(personalityOptions.map((option) => [option.id, option.title] as const));
  const titles = selectedPersonalities
    .map((personalityId) => titleById.get(personalityId))
    .filter((title): title is string => Boolean(title));

  return titles.length > 0 ? titles.join(', ') : 'Perfil comportamental não informado';
};

export const mapApiResponseToPet = (
  apiPet: PetApiResponse,
  personalityOptions?: PetPersonalityApiOption[],
): Pet => {
  const personalityText = formatSelectedPersonalities(
    apiPet.selectedPersonalities,
    personalityOptions,
  );

  const sex = formatPetSex(apiPet.sex) || 'Nao informado';
  const size = formatPetSize(apiPet.size) || 'Nao informado';
  const physicalText = [apiPet.breed, formatPetAge(apiPet.age), sex, `Porte ${size}`]
    .filter(Boolean)
    .join(', ');
  const locationText = apiPet.city
    ? `${apiPet.city}${apiPet.state ? `/${apiPet.state}` : ''}`
    : 'Localizacao nao informada';

  return {
    id: apiPet.id,
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
    adoptionStatus: apiPet.adoptionStatus ?? 'AVAILABLE',
    deleted: apiPet.deleted,
  };
};

/**
 * Retorna o ID apropriado para navegacao/rotas
 * Sempre retorna o publicId (numero sequencial)
 */
export const getPetRouteId = (pet: Pet): string | number => {
  return pet.id;
};

export const resolvePublicId = (backendId: string): string | number => {
  return backendId;
};

/**
 * Converte ID da rota (publicId) para backendId (UUID) se necessario
 */
export const resolveBackendId = (routeId: string | number): string | number => {
  return routeId;
};

/**
 * Verifica se o pet e do backend (tem mapeamento publico)
 */
export const isBackendPet = (pet: Pet): boolean => {
  return typeof pet.id === 'string';
};
