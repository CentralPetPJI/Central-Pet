export const SpeciesValues = ['dog', 'cat'] as const;
export type Species = (typeof SpeciesValues)[number];

export const SexValues = ['Femea', 'Macho'] as const;
export type Sex = (typeof SexValues)[number];

export const SizeValues = ['Pequeno', 'Medio', 'Grande'] as const;
export type Size = (typeof SizeValues)[number];

export const AdoptionStatusValues = ['available', 'in_process', 'adopted', 'unavailable'] as const;
export type AdoptionStatus = (typeof AdoptionStatusValues)[number];
