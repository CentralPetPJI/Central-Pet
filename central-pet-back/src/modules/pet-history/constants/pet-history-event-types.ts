export const petHistoryEventTypes = [
  'CREATED',
  'TRANSFERRED',
  'ADOPTION_APPROVED',
  'ADOPTION_REJECTED',
  'ADOPTION_CONTACT_SHARED',
  'RETURNED',
  'UPDATED',
] as const;

export type PetHistoryEventTypeValue = (typeof petHistoryEventTypes)[number];
