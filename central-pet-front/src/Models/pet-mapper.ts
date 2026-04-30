import type { PetApiResponse, PetListItem, Pet } from './pet';
import { PetRegisterFormData } from '@/storage/pets';

const normalizePetSize = (size: string): PetRegisterFormData['size'] => {
  if (size === 'small' || size === 'medium' || size === 'large') {
    return size;
  }

  return 'medium';
};

export const mapPetApiResponseToPetListItem = (pet: PetApiResponse): PetListItem => ({
  id: pet.id,
  name: pet.name,
  species: pet.species,
  breed: pet.breed || undefined,
  city: pet.city || undefined,
  state: pet.state,
  adoptionStatus: pet.adoptionStatus ?? 'AVAILABLE',
});

export const mapStoredPetToPetListItem = (pet: Pet): PetListItem => ({
  id: String(pet.id),
  name: pet.name,
  species: pet.species,
  adoptionStatus: 'AVAILABLE',
});

export const mapPetApiResponseToRegisterFormData = (pet: PetApiResponse): PetRegisterFormData => ({
  profilePhoto: pet.profilePhoto,
  galleryPhotos: pet.galleryPhotos ?? [],
  name: pet.name,
  age: pet.age,
  species: pet.species,
  breed: pet.breed,
  sex: pet.sex,
  size: normalizePetSize(pet.size),
  microchipped: pet.microchipped,
  vaccinated: pet.vaccinated,
  neutered: pet.neutered,
  dewormed: pet.dewormed,
  needsHealthCare: pet.needsHealthCare,
  physicalLimitation: pet.physicalLimitation,
  visualLimitation: pet.visualLimitation,
  hearingLimitation: pet.hearingLimitation,
});
