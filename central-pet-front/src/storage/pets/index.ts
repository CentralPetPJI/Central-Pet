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
  petAgeCategoryOptions,
  isPetRegisterFormDataLike,
  petRegisterFormSchema,
  petRegisterStorageKey,
  petSexOptions,
  petSizeOptions,
  petSpeciesOptions,
  type PetRegisterFormData,
} from './pet-register-form';
export {
  petPersonalityStorageKey,
  type PetPersonalityApiOption,
  type PetPersonalityOption,
} from './pet-personality-options';
export { sanitizePersonalityIconSvg } from './pet-personality-sanitizer';
export { PersonalityTraitIcon } from './personality-trait-icon';
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
