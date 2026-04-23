import type { AuthUser } from '@/Models/auth';
import type { PetRegisterFormData } from '@/storage/pets';

export type ResponsibleLocation = {
  city?: string;
  state?: string;
};

export const isProfileLocationComplete = (location: ResponsibleLocation): boolean =>
  Boolean(location.city?.trim() && location.state?.trim());

export const buildPetSubmitPayload = (
  data: PetRegisterFormData,
  currentUser: Pick<AuthUser, 'fullName' | 'organizationName' | 'role'>,
  selectedPersonalities: string[],
) => {
  const sourceName = currentUser.organizationName || currentUser.fullName;

  return {
    profilePhoto: data.profilePhoto,
    galleryPhotos: data.galleryPhotos ?? [],
    name: data.name.trim(),
    age: data.age.trim(),
    species: data.species,
    breed: data.breed.trim() || 'SRD',
    sex: data.sex,
    size: data.size,
    microchipped: data.microchipped,
    vaccinated: data.vaccinated,
    neutered: data.neutered,
    dewormed: data.dewormed,
    needsHealthCare: data.needsHealthCare,
    physicalLimitation: data.physicalLimitation,
    visualLimitation: data.visualLimitation,
    hearingLimitation: data.hearingLimitation,
    sourceType: currentUser.role,
    sourceName,
    selectedPersonalities,
  };
};
