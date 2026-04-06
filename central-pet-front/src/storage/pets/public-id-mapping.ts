/**
 * Sistema de mapeamento de IDs públicos (amigáveis) para IDs do backend (UUIDs)
 *
 * Garante que URLs sejam limpas (ex: /pets/1) enquanto internamente usa UUIDs do backend
 */

const PUBLIC_ID_MAPPING_KEY = 'central-pet:public-id-mapping';

export interface PublicIdMapping {
  publicId: number; // ID sequencial amigável para URLs
  backendId: string; // UUID do backend
  slug?: string; // Opcional: nome-do-pet para URLs semânticas
}

let publicIdCounter: number | null = null;

/**
 * Inicializa o contador de IDs públicos
 */
const initializeCounter = (): void => {
  if (publicIdCounter !== null) return;

  const mappings = getPublicIdMappings();
  if (mappings.length === 0) {
    publicIdCounter = 1;
  } else {
    publicIdCounter = Math.max(...mappings.map((m) => m.publicId)) + 1;
  }
};

/**
 * Retorna todos os mapeamentos salvos
 */
export const getPublicIdMappings = (): PublicIdMapping[] => {
  const stored = window.localStorage.getItem(PUBLIC_ID_MAPPING_KEY);
  return stored ? JSON.parse(stored) : [];
};

/**
 * Salva um novo mapeamento publicId <-> backendId
 */
export const savePublicIdMapping = (backendId: string, slug?: string): number => {
  initializeCounter();

  const mappings = getPublicIdMappings();

  // Verifica se já existe mapeamento para este backendId
  const existing = mappings.find((m) => m.backendId === backendId);
  if (existing) {
    return existing.publicId;
  }

  // Cria novo publicId
  const publicId = publicIdCounter!;
  publicIdCounter!++;

  const newMapping: PublicIdMapping = { publicId, backendId, slug };
  mappings.push(newMapping);

  window.localStorage.setItem(PUBLIC_ID_MAPPING_KEY, JSON.stringify(mappings));
  return publicId;
};

/**
 * Converte publicId (da URL) para backendId (UUID)
 */
export const getBackendIdFromPublic = (publicId: number): string | undefined => {
  const mappings = getPublicIdMappings();
  return mappings.find((m) => m.publicId === publicId)?.backendId;
};

/**
 * Converte backendId (UUID) para publicId (para URL)
 */
export const getPublicIdFromBackend = (backendId: string): number | undefined => {
  const mappings = getPublicIdMappings();
  return mappings.find((m) => m.backendId === backendId)?.publicId;
};

/**
 * Gera slug a partir do nome do pet
 */
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-') // Substitui não-alfanuméricos por hífen
    .replace(/^-+|-+$/g, ''); // Remove hífens do início/fim
};

/**
 * Garante que um pet do backend tenha um publicId
 * Retorna o publicId (existente ou novo)
 */
export const ensurePublicId = (backendId: string, petName?: string): number => {
  const existing = getPublicIdFromBackend(backendId);
  if (existing !== undefined) {
    return existing;
  }

  const slug = petName ? generateSlug(petName) : undefined;
  return savePublicIdMapping(backendId, slug);
};

/**
 * Limpa mapeamentos antigos (útil para testes ou reset)
 */
export const clearPublicIdMappings = (): void => {
  window.localStorage.removeItem(PUBLIC_ID_MAPPING_KEY);
  publicIdCounter = null;
};
