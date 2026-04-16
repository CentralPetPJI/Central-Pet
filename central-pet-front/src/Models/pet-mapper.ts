import type { PetApiResponse, PetListItem, Pet } from './pet';
import type { PetRegisterFormData } from '@/storage/pets';

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
  size: pet.size,
  microchipped: pet.microchipped,
  tutor: pet.tutor,
  shelter: pet.shelter,
  city: pet.city,
  state: pet.state ?? 'SP',
  contact: pet.contact,
  vaccinated: pet.vaccinated,
  neutered: pet.neutered,
  dewormed: pet.dewormed,
  needsHealthCare: pet.needsHealthCare,
  physicalLimitation: pet.physicalLimitation,
  visualLimitation: pet.visualLimitation,
  hearingLimitation: pet.hearingLimitation,
  responsibleUserId: pet.responsibleUserId ?? '',
  sourceType: pet.sourceType ?? 'ONG',
  sourceName: pet.sourceName ?? '',
});
