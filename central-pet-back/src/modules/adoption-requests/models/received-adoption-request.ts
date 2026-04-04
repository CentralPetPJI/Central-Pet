import type { MockAdoptionRequest } from '@/mocks';
import type { MockPet } from '@/mocks';
import type { MockUser } from '@/mocks';

export type ReceivedAdoptionRequest = {
  id: string;
  pet: {
    id: number;
    name: string;
    species: string;
    city: string;
    state: string;
    responsibleUserId: string;
    sourceType: 'ONG' | 'PESSOA_FISICA';
    sourceName: string;
  };
  adopter: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
  message: string;
  status: MockAdoptionRequest['status'];
  requestedAt: string;
};

type ReceivedAdoptionRequestSource = {
  request: MockAdoptionRequest;
  pet: MockPet;
  adopter: MockUser;
};

export const mapToReceivedAdoptionRequest = ({
  request,
  pet,
  adopter,
}: ReceivedAdoptionRequestSource): ReceivedAdoptionRequest => ({
  id: request.id,
  pet: {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    city: pet.city ?? 'UNKNOWN_CITY',
    state: pet.state ?? 'UNKNOWN_STATE',
    responsibleUserId: pet.responsibleUserId,
    sourceType: pet.sourceType ?? 'ONG',
    sourceName: pet.sourceName ?? 'UNKNOWN_SOURCE',
  },
  adopter: {
    id: adopter.id,
    name: adopter.fullName,
    city: adopter.city ?? 'UNKNOWN_CITY',
    state: adopter.state ?? 'UNKNOWN_STATE',
  },
  message: request.message,
  status: request.status,
  requestedAt: request.requestedAt,
});
