export const SpeciesValues = ['dog', 'cat'] as const;
export type Species = (typeof SpeciesValues)[number];

export const SexValues = ['female', 'male'] as const;
export type Sex = (typeof SexValues)[number];

export const SizeValues = ['small', 'medium', 'large'] as const;
export type Size = (typeof SizeValues)[number];

export const PetAgeCategoryValues = ['FILHOTE', 'JOVEM', 'ADULTO', 'IDOSO'] as const;
export type PetAgeCategory = (typeof PetAgeCategoryValues)[number];

export const AdoptionStatusValues = ['available', 'in_process', 'adopted', 'unavailable'] as const;
export type AdoptionStatus = (typeof AdoptionStatusValues)[number];
