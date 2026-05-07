export interface PetPersonalityOption {
  id: string;
  title: string;
  description: string;
  conflictsWith: string[];
  iconSvg: string;
}

export type PetPersonalityApiOption = PetPersonalityOption;

export const petPersonalityStorageKey = 'central-pet:selected-personalities';

const unsafeSvgPattern = /<script|on[a-z]+\s*=|foreignObject|href\s*=|xlink:href\s*=/i;

export const isSafePersonalityIconSvg = (iconSvg: string): boolean =>
  iconSvg.trim().startsWith('<svg') &&
  iconSvg.includes('viewBox=') &&
  !unsafeSvgPattern.test(iconSvg);

interface PersonalityTraitIconProps {
  iconSvg: string;
}

export const PersonalityTraitIcon = ({ iconSvg }: PersonalityTraitIconProps) => {
  if (!isSafePersonalityIconSvg(iconSvg)) {
    return null;
  }

  return (
    <span
      aria-hidden="true"
      className="inline-flex h-7 w-7 [&_svg]:h-7 [&_svg]:w-7"
      dangerouslySetInnerHTML={{ __html: iconSvg }}
    />
  );
};
