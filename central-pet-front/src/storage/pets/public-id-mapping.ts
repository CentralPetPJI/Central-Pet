export interface PublicIdMapping {
  publicId: string;
  backendId?: string;
  slug?: string;
}

export const getPublicIdMappings = (): PublicIdMapping[] => [];

export const initializeCounterWithLocalPets = (_localPetIds: number[]): void => {};

export const savePublicIdMapping = (backendId?: string, _slug?: string): string => backendId ?? '';

export const updatePublicIdMapping = (
  _publicId: string,
  _backendId: string,
  _slug?: string,
): void => {};

export const saveBatchPublicIdMappings = (_backendIds: string[]): void => {};

export const getBackendIdFromPublic = (publicId: string | number): string | undefined => {
  const normalized = String(publicId);
  return normalized.length > 0 ? normalized : undefined;
};

export const getPublicIdFromBackend = (backendId: string): string | undefined => {
  return backendId || undefined;
};

export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const ensurePublicId = (backendId: string, _petName?: string): string => backendId;

export const clearPublicIdMappings = (): void => {};
