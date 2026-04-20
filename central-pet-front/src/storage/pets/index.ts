export {
  buildRegisterFormDataFromPet,
  getPetById,
  getPetProfileById,
  getStoredPets,
  petProfilesStorageKey,
  petsStorageKey,
  savePet,
  type PetProfileRecord,
} from './pets-storage';
export {
  isPetRegisterFormDataLike,
  petRegisterFormSchema,
  petRegisterStorageKey,
  petSexOptions,
  petSizeOptions,
  petSpeciesOptions,
  type PetRegisterFormData,
} from './pet-register-form';
export {
  petPersonalityOptions,
  petPersonalityStorageKey,
  type PetPersonalityOption,
} from './pet-personality-options';
export { getPetRouteId, isBackendPet, mapApiResponseToPet, resolveBackendId } from './pet-helpers';
export {
  ensurePublicId,
  getBackendIdFromPublic,
  getPublicIdFromBackend,
  clearPublicIdMappings,
  initializeCounterWithLocalPets,
  updatePublicIdMapping,
  type PublicIdMapping,
} from './public-id-mapping';
