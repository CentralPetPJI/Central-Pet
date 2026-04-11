import type { AdoptionRequestRecord } from './adoption-request-record';
import type { AdoptionRequestStatus } from './adoption-request-status';

export type ReceivedAdoptionRequestPet = {
  id: string;
  name: string;
  species: string;
  city: string;
  state: string;
  responsibleUserId: string | undefined;
  sourceType: 'ONG' | 'PESSOA_FISICA' | null | undefined;
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

export const mapToReceivedAdoptionRequest = ({
  request,
  pet,
  adopter,
}: ReceivedAdoptionRequestSource): ReceivedAdoptionRequest => ({
  id: request.id,
  pet,
  adopter,
  message: request.message,
  adopterContactShareConsent: request.adopterContactShareConsent,
  status: request.status,
  note: request.note ?? undefined,
  requestedAt: request.requestedAt.toISOString(),
  updatedAt: request.updatedAt.toISOString(),
});
