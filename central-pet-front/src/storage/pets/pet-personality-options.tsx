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

interface PersonalityTraitIconProps {
  iconSvg: string;
}

export const PersonalityTraitIcon = ({ iconSvg }: PersonalityTraitIconProps) => {
  const sanitizedIconSvg = sanitizePersonalityIconSvg(iconSvg).trim();

  if (!sanitizedIconSvg.startsWith('<svg')) {
    return null;
  }

  return (
    <span
      aria-hidden="true"
      className="inline-flex h-7 w-7 [&_svg]:h-7 [&_svg]:w-7"
      dangerouslySetInnerHTML={{ __html: sanitizedIconSvg }}
    />
  );
};
