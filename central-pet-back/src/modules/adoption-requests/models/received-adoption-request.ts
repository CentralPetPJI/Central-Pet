import type { AdoptionRequestStatus } from './adoption-request-status';
import type { PetForAdoptionRequest } from '../../pets/pets.service';

export type ReceivedAdoptionRequestPet = {
  id: string;
  name: string;
  species: string;
  city: string;
  state: string;
  responsibleUserId: string | undefined;
  sourceType?: 'ONG' | 'PESSOA_FISICA';
  sourceName: string | null | undefined;
};

export type ReceivedAdoptionRequestUser = {
  id: string;
  name: string;
  city: string;
  state: string;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
};

export type ReceivedAdoptionRequest = {
  id: string;
  pet: ReceivedAdoptionRequestPet;
  adopter: ReceivedAdoptionRequestUser;
  responsible?: ReceivedAdoptionRequestUser;
  message: string;
  adopterContactShareConsent: boolean;
  responsibleContactShareConsent: boolean;
  status: AdoptionRequestStatus;
  note?: string;
  requestedAt: string;
  updatedAt: string;
};

export function mapPetForResponse(pet: PetForAdoptionRequest): ReceivedAdoptionRequestPet {
  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    city: pet.city,
    state: pet.state ?? '',
    responsibleUserId: pet.responsibleUserId,
    sourceType: pet.sourceType,
    sourceName: pet.sourceName,
  };
}

export function mapAdopterForResponse(
  userId: string,
  persistedUsersById: Map<
    string,
    {
      id: string;
      fullName: string;
      email?: string | null;
      city?: string | null;
      state?: string | null;
      phone?: string | null;
      mobile?: string | null;
    }
  >,
  includeContact = false,
): ReceivedAdoptionRequestUser {
  const persistedUser = persistedUsersById.get(userId);
  if (persistedUser) {
    return {
      id: persistedUser.id,
      name: persistedUser.fullName,
      city: persistedUser.city ?? '',
      state: persistedUser.state ?? '',
      email: includeContact ? (persistedUser.email ?? null) : undefined,
      phone: includeContact ? (persistedUser.phone ?? null) : undefined,
      mobile: includeContact ? (persistedUser.mobile ?? null) : undefined,
    };
  }

  return {
    id: userId,
    name: 'Usuário não encontrado',
    city: '',
    state: '',
  };
}
