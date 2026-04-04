const PET_ID_MAPPING_KEY = 'central-pet:id-mapping';

export interface PetIdMapping {
  localId: number;
  backendId: string;
}

export const getIdMappings = (): PetIdMapping[] => {
  const stored = window.localStorage.getItem(PET_ID_MAPPING_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveIdMapping = (localId: number, backendId: string): void => {
  const mappings = getIdMappings();
  const filtered = mappings.filter((m) => m.localId !== localId && m.backendId !== backendId);

  filtered.push({ localId, backendId });
  window.localStorage.setItem(PET_ID_MAPPING_KEY, JSON.stringify(filtered));
};

export const getBackendId = (localId: number): string | undefined => {
  const mappings = getIdMappings();
  return mappings.find((m) => m.localId === localId)?.backendId;
};

export const getLocalId = (backendId: string): number | undefined => {
  const mappings = getIdMappings();
  return mappings.find((m) => m.backendId === backendId)?.localId;
};

export const isPetSynced = (localId: number): boolean => {
  return getBackendId(localId) !== undefined;
};
