/**
 * Gerencia o mapeamento entre IDs locais (number) e IDs do backend (UUID string)
 * Permite trabalhar com IDs numéricos no frontend enquanto mantém sincronização com backend
 */

const PET_ID_MAPPING_KEY = 'central-pet:id-mapping';

export interface PetIdMapping {
  localId: number;
  backendId: string;
}

/**
 * Retorna todos os mapeamentos salvos
 */
export const getIdMappings = (): PetIdMapping[] => {
  const stored = window.localStorage.getItem(PET_ID_MAPPING_KEY);
  return stored ? JSON.parse(stored) : [];
};

/**
 * Salva um novo mapeamento local ↔ backend
 */
export const saveIdMapping = (localId: number, backendId: string): void => {
  const mappings = getIdMappings();

  // Remove mapeamento anterior se existir
  const filtered = mappings.filter((m) => m.localId !== localId && m.backendId !== backendId);

  filtered.push({ localId, backendId });
  window.localStorage.setItem(PET_ID_MAPPING_KEY, JSON.stringify(filtered));
};

/**
 * Busca o ID do backend a partir do ID local
 */
export const getBackendId = (localId: number): string | undefined => {
  const mappings = getIdMappings();
  return mappings.find((m) => m.localId === localId)?.backendId;
};

/**
 * Busca o ID local a partir do ID do backend
 */
export const getLocalId = (backendId: string): number | undefined => {
  const mappings = getIdMappings();
  return mappings.find((m) => m.backendId === backendId)?.localId;
};

/**
 * Verifica se um pet já foi sincronizado com o backend
 */
export const isPetSynced = (localId: number): boolean => {
  return getBackendId(localId) !== undefined;
};
