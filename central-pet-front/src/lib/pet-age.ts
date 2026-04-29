export const petAgeCategoryValues = ['FILHOTE', 'JOVEM', 'ADULTO', 'IDOSO'] as const;

export type PetAgeCategory = (typeof petAgeCategoryValues)[number];

export const petAgeCategoryOptions = [
  { value: 'FILHOTE', label: 'Filhote', description: 'menos de 1 ano' },
  { value: 'JOVEM', label: 'Jovem', description: 'entre 1 e 2 anos' },
  { value: 'ADULTO', label: 'Adulto', description: 'entre 2 e 8 anos' },
  { value: 'IDOSO', label: 'Idoso', description: 'mais de 8 anos' },
] as const satisfies ReadonlyArray<{
  value: PetAgeCategory;
  label: string;
  description: string;
}>;

const petAgeCategoryLabelMap: Record<PetAgeCategory, string> = {
  FILHOTE: 'Filhote',
  JOVEM: 'Jovem',
  ADULTO: 'Adulto',
  IDOSO: 'Idoso',
};

const petAgeCategoryFromLabelMap = Object.fromEntries(
  petAgeCategoryOptions.map((option) => [option.label.toLowerCase(), option.value]),
) as Record<string, PetAgeCategory>;

export const isPetAgeCategory = (value: string | undefined | null): value is PetAgeCategory =>
  typeof value === 'string' &&
  (petAgeCategoryValues as readonly string[]).includes(value.trim().toUpperCase());

export const normalizePetAgeCategory = (
  value: string | undefined | null,
): PetAgeCategory | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();
  const normalizedValue = trimmedValue.toUpperCase();

  if (isPetAgeCategory(normalizedValue)) {
    return normalizedValue;
  }

  return petAgeCategoryFromLabelMap[trimmedValue.toLowerCase()];
};

export const formatPetAge = (value: string | undefined): string => {
  const normalizedValue = normalizePetAgeCategory(value);
  return normalizedValue ? petAgeCategoryLabelMap[normalizedValue] : value?.trim() || '';
};
