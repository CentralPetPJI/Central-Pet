import type { PetApiResponse, PetListItem, Pet } from './pet';

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
