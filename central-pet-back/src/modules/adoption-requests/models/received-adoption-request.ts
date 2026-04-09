import type { AdoptionRequest } from './adoption-request';
import type {
  AdoptionRequestPetSnapshot,
  AdoptionRequestAdopterSnapshot,
  MockAdoptionRequest,
} from '@/mocks';

export type ReceivedAdoptionRequest = {
  id: string;
  pet: {
    id: number | string;
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
  rejectionReason?: string;
  requestedAt: string;
  updatedAt: string;
};

type ReceivedAdoptionRequestSource = {
  request: MockAdoptionRequest;
  pet: AdoptionRequestPetSnapshot;
  adopter: AdoptionRequestAdopterSnapshot;
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
    city: pet.city,
    state: pet.state,
    responsibleUserId: pet.responsibleUserId,
    sourceType: pet.sourceType,
    sourceName: pet.sourceName,
  },
  adopter: {
    id: adopter.id,
    name: adopter.name,
    city: adopter.city,
    state: adopter.state,
  },
  message: request.message,
  status: request.status,
  rejectionReason: request.rejectionReason,
  requestedAt: request.requestedAt,
  updatedAt: request.updatedAt,
});
