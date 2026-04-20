import type { MockPet } from '@/mocks';
import { toISO } from '@/utils/date.util';

export type PetAdoptionStatus = 'AVAILABLE' | 'IN_PROCESS' | 'ADOPTED' | 'UNAVAILABLE';
export type PetSourceType = 'ONG' | 'PESSOA_FISICA';

export type PetRecord = {
  id: string;
  profilePhoto: string;
  galleryPhotos: string[];
  name: string;
  age: string;
  species: string;
  breed: string;
  sex: string;
  size: string;
  microchipped: boolean;
  tutor: string;
  shelter: string;
  city: string;
  state?: string;
  contact: string;
  vaccinated: boolean;
  neutered: boolean;
  dewormed: boolean;
  needsHealthCare: boolean;
  physicalLimitation: boolean;
  visualLimitation: boolean;
  hearingLimitation: boolean;
  selectedPersonalities: string[];
  responsibleUserId: string;
  adoptionStatus: PetAdoptionStatus;
  sourceType?: PetSourceType;
  sourceName?: string;
  createdAt: string;
  updatedAt: string;
};

const normalizeSpecies = (species: string): string => {
  const speciesMap: Record<string, string> = {
    dog: 'DOG',
    cat: 'CAT',
  };

  const normalized = species.toLowerCase();
  return speciesMap[normalized] || 'DOG';
};

const normalizeSex = (sex: string): string => {
  const sexMap: Record<string, string> = {
    male: 'MALE',
    female: 'FEMALE',
  };

  const normalized = sex.toLowerCase();
  return sexMap[normalized] || 'MALE';
};

const normalizeSize = (size: string): string => {
  const sizeMap: Record<string, string> = {
    small: 'SMALL',
    medium: 'MEDIUM',
    large: 'LARGE',
  };

  const normalized = size.toLowerCase();
  return sizeMap[normalized] || 'MEDIUM';
};

export const mapMockPetToPetRecord = (pet: MockPet): PetRecord => ({
  id: String(pet.id),
  profilePhoto: pet.photo ?? '',
  galleryPhotos: [],
  name: pet.name,
  age: pet.ageMonths ? `${pet.ageMonths} meses` : '',
  species: normalizeSpecies(pet.species ?? ''),
  breed: pet.breed ?? '',
  sex: normalizeSex(pet.sex ?? ''),
  size: normalizeSize(pet.size ?? ''),
  microchipped: false,
  tutor: pet.sourceName ?? '',
  shelter: pet.sourceName ?? '',
  city: pet.city ?? '',
  state: pet.state,
  contact: '',
  vaccinated: pet.vaccinated,
  neutered: pet.neutered,
  dewormed: pet.dewormed,
  needsHealthCare: false,
  physicalLimitation: false,
  visualLimitation: false,
  hearingLimitation: false,
  selectedPersonalities: [],
  responsibleUserId: pet.responsibleUserId,
  adoptionStatus: (pet.adoptionStatus as PetAdoptionStatus) ?? 'AVAILABLE',
  sourceType: pet.sourceType,
  sourceName: pet.sourceName,
  createdAt: toISO(pet.createdAt),
  updatedAt: toISO(pet.updatedAt),
});

export const mapPetRecordToPersistence = (pet: PetRecord): PetRecord => ({
  ...pet,
});
