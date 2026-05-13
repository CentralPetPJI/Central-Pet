import { sanitizePersonalityIconSvg } from '@/storage/pets/pet-personality-options';

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
