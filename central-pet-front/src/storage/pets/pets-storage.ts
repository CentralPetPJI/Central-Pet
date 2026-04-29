import type { Pet } from '@/Models/pet';
import { type PetRegisterFormData } from './pet-register-form';

export const petsStorageKey = 'central-pet:pets';
export const petProfilesStorageKey = 'central-pet:pet-profiles';
const validSpecies = new Set(['dog', 'cat']);

export interface PetProfileRecord {
  id: number;
  formData: PetRegisterFormData;
  selectedPersonalities: string[];
}

const isPetProfileRecordLike = (
  value: unknown,
): value is { id: number; formData?: unknown; selectedPersonalities?: unknown } =>
  typeof value === 'object' && value !== null && 'id' in value && typeof value.id === 'number';

const normalizePetProfileRecord = (value: unknown): PetProfileRecord | undefined => {
  if (!isPetProfileRecordLike(value)) {
    return undefined;
  }

  const formData = value.formData as PetRegisterFormData;
  if (!formData) {
    return undefined;
  }
  return {
    id: value.id,
    formData,
    selectedPersonalities: Array.isArray(value.selectedPersonalities)
      ? value.selectedPersonalities.filter((item): item is string => typeof item === 'string')
      : [],
  };
};

const isPetLike = (value: unknown): value is Pet =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  typeof value.id === 'number' &&
  'name' in value &&
  typeof value.name === 'string' &&
  'species' in value &&
  typeof value.species === 'string' &&
  'photo' in value &&
  typeof value.photo === 'string' &&
  'physicalCharacteristics' in value &&
  typeof value.physicalCharacteristics === 'string' &&
  'behavioralCharacteristics' in value &&
  typeof value.behavioralCharacteristics === 'string' &&
  'notes' in value &&
  typeof value.notes === 'string' &&
  validSpecies.has(String(value.species));

export const getStoredPets = (): Pet[] => {
  const rawPets = window.localStorage.getItem(petsStorageKey);

  if (!rawPets) {
    return [];
  }

  try {
    const parsedPets = JSON.parse(rawPets) as unknown;

    if (!Array.isArray(parsedPets)) {
      window.localStorage.removeItem(petsStorageKey);
      return [];
    }

    const validPets = parsedPets.filter(isPetLike);

    // Persist only valid pets to keep storage clean
    if (validPets.length < parsedPets.length) {
      window.localStorage.setItem(petsStorageKey, JSON.stringify(validPets));
    }

    return validPets;
  } catch {
    window.localStorage.removeItem(petsStorageKey);
    return [];
  }
};

export const savePet = (pet: Pet, profileRecord: PetProfileRecord): Pet[] => {
  const currentPets = getStoredPets();
  const filteredPets = currentPets.filter((currentPet) => currentPet.id !== pet.id);
  const updatedPets = [pet, ...filteredPets];
  window.localStorage.setItem(petsStorageKey, JSON.stringify(updatedPets));

  let filteredProfiles: PetProfileRecord[] = [];

  try {
    const rawProfiles = window.localStorage.getItem(petProfilesStorageKey);
    const currentProfiles = rawProfiles
      ? ((JSON.parse(rawProfiles) as PetProfileRecord[]) ?? [])
      : [];
    filteredProfiles = Array.isArray(currentProfiles)
      ? currentProfiles.filter((profile) => profile?.id !== profileRecord.id)
      : [];
  } catch {
    window.localStorage.removeItem(petProfilesStorageKey);
  }

  window.localStorage.setItem(
    petProfilesStorageKey,
    JSON.stringify([profileRecord, ...filteredProfiles]),
  );

  return updatedPets;
};

export const getPetById = (petId: number): Pet | undefined =>
  getStoredPets().find((pet) => pet.id === petId);

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
  const normalizedSex = normalizedSexSource.includes('female') ? 'female' : 'male';
  const normalizedSize = normalizedSizeSource.includes('small')
    ? 'small'
    : normalizedSizeSource.includes('large')
      ? 'large'
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

export const getPetProfileById = (petId: number): PetProfileRecord | undefined => {
  const rawProfiles = window.localStorage.getItem(petProfilesStorageKey);

  if (!rawProfiles) {
    return undefined;
  }

  try {
    const parsedProfiles = JSON.parse(rawProfiles) as unknown;

    if (!Array.isArray(parsedProfiles)) {
      window.localStorage.removeItem(petProfilesStorageKey);
      return undefined;
    }

    const normalizedProfiles = parsedProfiles
      .map((profile) => normalizePetProfileRecord(profile))
      .filter((profile): profile is PetProfileRecord => profile !== undefined);

    return normalizedProfiles.find((profile) => profile.id === petId);
  } catch {
    window.localStorage.removeItem(petProfilesStorageKey);
    return undefined;
  }
};
