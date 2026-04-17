export enum AdoptionRequestStatus {
  PENDING = 'PENDING',
  CONTACT_SHARED = 'CONTACT_SHARED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export const simulateAdoptionRequestInitialStatuses = [
  AdoptionRequestStatus.PENDING,
  AdoptionRequestStatus.CONTACT_SHARED,
] as const;

export type SimulateAdoptionRequestInitialStatus =
  (typeof simulateAdoptionRequestInitialStatuses)[number];

export function canShareContactForStatus(status: AdoptionRequestStatus): boolean {
  return status === AdoptionRequestStatus.PENDING;
}

export function canApproveForStatus(status: AdoptionRequestStatus): boolean {
  return status === AdoptionRequestStatus.CONTACT_SHARED;
}

export function canRejectForStatus(status: AdoptionRequestStatus): boolean {
  return (
    status === AdoptionRequestStatus.PENDING || status === AdoptionRequestStatus.CONTACT_SHARED
  );
}
