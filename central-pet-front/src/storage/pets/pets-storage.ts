import type { Pet } from '@/Models/pet';
import { type PetRegisterFormData } from './pet-register-form';

const normalizeTextForComparison = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export const buildRegisterFormDataFromPet = (pet: Pet): PetRegisterFormData => {
  const physicalParts = pet.physicalCharacteristics.split(',').map((part) => part.trim());
  const [breed = 'SRD', age = '', sex = 'male', sizePart = 'porte Medio'] = physicalParts;
  const normalizedSexSource = normalizeTextForComparison(sex);
  const normalizedSizeSource = normalizeTextForComparison(sizePart);
  const normalizedSex =
    normalizedSexSource.includes('female') || normalizedSexSource.includes('femea')
      ? 'female'
      : normalizedSexSource.includes('male') || normalizedSexSource.includes('macho')
        ? 'male'
        : 'male';
  const normalizedSize =
    normalizedSizeSource.includes('small') || normalizedSizeSource.includes('pequeno')
      ? 'small'
      : normalizedSizeSource.includes('large') || normalizedSizeSource.includes('grande')
        ? 'large'
        : normalizedSizeSource.includes('medium') || normalizedSizeSource.includes('medio')
          ? 'medium'
          : 'medium';

  return {
    dewormed: false,
    galleryPhotos: [],
    hearingLimitation: false,
    microchipped: false,
    needsHealthCare: false,
    neutered: false,
    physicalLimitation: false,
    vaccinated: false,
    visualLimitation: false,
    name: pet.name,
    species: pet.species,
    breed,
    age,
    sex: normalizedSex,
    size: normalizedSize,
    profilePhoto: pet.photo,
  };
};
