import type { MockPet } from '../../../mocks/pets.mock';
import type { MockUser } from '../../../mocks/users.mock';

export type PetHistoryEventName = 'PET_REGISTERED' | 'ADOPTION' | 'RETURNED' | 'TRANSFERRED';

export type PetHistoryRecord = {
  id: string;
  pet: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    fullName: string;
  };
  eventName: PetHistoryEventName;
  createdAt: string;
};

type PetHistoryRecordSource = {
  id: string;
  petId: string;
  petName: string;
  userId: string;
  fullName: string;
  eventName: PetHistoryEventName;
  createdAt: string;
};

export const mapToPetHistoryRecord = ({
  id,
  petId,
  petName,
  userId,
  fullName,
  eventName,
  createdAt,
}: PetHistoryRecordSource): PetHistoryRecord => ({
  id,
  pet: {
    id: petId,
    name: petName,
  },
  user: {
    id: userId,
    fullName,
  },
  eventName,
  createdAt,
});

export const resolvePetHistoryPetName = (pet: MockPet | undefined, fallback: string): string =>
  pet?.name ?? fallback;

export const resolvePetHistoryUser = (
  user: MockUser | undefined,
  fallbackId: string,
  fallbackName: string,
) => ({
  id: user?.id ?? fallbackId,
  fullName: user?.fullName ?? fallbackName,
});
