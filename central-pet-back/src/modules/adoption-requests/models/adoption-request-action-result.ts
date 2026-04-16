import type { ReceivedAdoptionRequest } from './received-adoption-request';

export type AdoptionRequestNotification = {
  id: string;
  requestId: string;
  recipientId: string;
  type: 'CONTACT_SHARED' | 'REJECTED';
  message: string;
  createdAt: string;
};

export type AdoptionRequestActionResult = {
  message: string;
  data: ReceivedAdoptionRequest;
  notification?: AdoptionRequestNotification;
};
