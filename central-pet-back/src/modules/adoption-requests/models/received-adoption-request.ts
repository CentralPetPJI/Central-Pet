import type { AdoptionRequestRecord } from './adoption-request-record';
import type { AdoptionRequestStatus } from './adoption-request-status';
import type { PetForAdoptionRequest } from '../../pets/pets.service';
import type { MockUser } from '@/mocks';

export type ReceivedAdoptionRequestPet = {
  id: string;
  name: string;
  species: string;
  city: string;
  state: string;
  responsibleUserId: string | undefined;
  sourceType: 'ONG' | 'PESSOA_FISICA';
  sourceName: string | null | undefined;
};

export type ReceivedAdoptionRequestAdopter = {
  id: string;
  name: string;
  city: string;
  state: string;
};

export type ReceivedAdoptionRequest = {
  id: string;
  pet: ReceivedAdoptionRequestPet;
  adopter: ReceivedAdoptionRequestAdopter;
  message: string;
  adopterContactShareConsent: boolean;
  responsibleContactShareConsent: boolean;
  status: AdoptionRequestStatus;
  note?: string;
  requestedAt: string;
  updatedAt: string;
};

type ReceivedAdoptionRequestSource = {
  request: AdoptionRequestRecord;
  pet: ReceivedAdoptionRequestPet;
  adopter: ReceivedAdoptionRequestAdopter;
};

export function mapPetForResponse(pet: PetForAdoptionRequest): ReceivedAdoptionRequestPet {
  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    city: pet.city,
    state: pet.state,
    responsibleUserId: pet.responsibleUserId,
    sourceType: pet.sourceType,
    sourceName: pet.sourceName,
  };
}

export function mapAdopterForResponse(
  adopterId: string,
  persistedUsersById: Map<string, { id: string; fullName: string }>,
): ReceivedAdoptionRequestAdopter {
  // Treat persisted users and mock users as the same kind of entity.
  // Prefer persisted user when available, otherwise fall back to mock seed data.
  const persistedUser = persistedUsersById.get(adopterId);
  if (persistedUser) {
    return {
      id: persistedUser.id,
      name: persistedUser.fullName,
      city: '',
      state: '',
    };
  }

  return {
    id: adopterId,
    name: 'Usuário não encontrado',
    city: '',
    state: '',
  };
}
