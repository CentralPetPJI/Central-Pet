export const adoptionRequestStatuses = [
  'pending',
  'contact_shared',
  'approved',
  'rejected',
] as const;

export const simulateAdoptionRequestInitialStatuses = ['pending', 'contact_shared'] as const;

export type AdoptionRequestStatus = (typeof adoptionRequestStatuses)[number];
export type SimulateAdoptionRequestInitialStatus =
  (typeof simulateAdoptionRequestInitialStatuses)[number];

export function canShareContactForStatus(status: AdoptionRequestStatus): boolean {
  return status === 'pending';
}

export function canApproveForStatus(status: AdoptionRequestStatus): boolean {
  return status === 'contact_shared';
}

export function canRejectForStatus(status: AdoptionRequestStatus): boolean {
  return status === 'contact_shared';
}
