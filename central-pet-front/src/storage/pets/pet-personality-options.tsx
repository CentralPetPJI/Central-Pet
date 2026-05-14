export interface PetPersonalityOption {
  id: string;
  title: string;
  description: string;
  conflictsWith: string[];
  iconSvg: string;
}

export type PetPersonalityApiOption = PetPersonalityOption;

export const petPersonalityStorageKey = 'central-pet:selected-personalities';
