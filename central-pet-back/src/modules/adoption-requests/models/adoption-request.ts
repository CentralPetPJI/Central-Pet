/**
 * Modelo interno de adoption request
 * Não depende dos mocks, apenas armazena snapshots do pet e adotante
 */

export type AdoptionRequestStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'contact_shared'
  | 'rejected';

export type AdoptionRequestPetSnapshot = {
  id: string;
  name: string;
  species: string;
  city: string;
  state: string;
  responsibleUserId: string;
  sourceType: 'ONG' | 'PESSOA_FISICA';
  sourceName: string;
};

export type AdoptionRequestAdopterSnapshot = {
  id: string;
  name: string;
  city: string;
  state: string;
};

export type AdoptionRequest = {
  id: string;
  petId: number | string;
  petSnapshot?: AdoptionRequestPetSnapshot;
  adopterId: string;
  adopterSnapshot?: AdoptionRequestAdopterSnapshot;
  message: string;
  status: AdoptionRequestStatus;
  rejectionReason?: string;
  requestedAt: string;
  updatedAt: string;
};
