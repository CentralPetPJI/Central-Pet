import type { AdoptionRequestStatus } from './adoption-request-status';

export type AdoptionRequestRecord = {
  id: string;
  petId: string;
  responsibleUserId: string;
  adopterId: string;
  adopterContactShareConsent: boolean;
  message: string;
  status: AdoptionRequestStatus;
  note: string | null;
  requestedAt: Date;
  updatedAt: Date;
};
