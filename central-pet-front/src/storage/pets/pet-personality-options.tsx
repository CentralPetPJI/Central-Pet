import DOMPurify from 'dompurify';

export interface PetPersonalityOption {
  id: string;
  title: string;
  description: string;
  conflictsWith: string[];
  iconSvg: string;
}

export type PetPersonalityApiOption = PetPersonalityOption;

export const petPersonalityStorageKey = 'central-pet:selected-personalities';

export const sanitizePersonalityIconSvg = (iconSvg: string): string =>
  DOMPurify.sanitize(iconSvg, {
    USE_PROFILES: { svg: true, svgFilters: true },
  });
