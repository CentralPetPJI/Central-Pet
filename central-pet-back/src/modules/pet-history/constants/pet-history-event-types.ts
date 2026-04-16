export const petHistoryEventTypes = [
  'CREATED',
  'TRANSFERRED',
  'ADOPTION_APPROVED',
  'RETURNED',
  'UPDATED',
] as const;

export type PetHistoryEventTypeValue = (typeof petHistoryEventTypes)[number];
