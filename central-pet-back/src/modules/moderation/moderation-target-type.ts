export const ModerationTargetType = {
  PET: 'PET',
  USER: 'USER',
  ADOPTION_REQUEST: 'ADOPTION_REQUEST',
} as const;

export type ModerationTargetType = (typeof ModerationTargetType)[keyof typeof ModerationTargetType];
