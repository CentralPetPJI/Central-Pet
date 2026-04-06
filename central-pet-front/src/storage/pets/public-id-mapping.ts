/**
 * Sistema de mapeamento de IDs públicos (amigáveis) para IDs do backend (UUIDs)
 *
 * Garante que URLs sejam limpas (ex: /pets/1) enquanto internamente usa UUIDs do backend
 *
 * Para pets mockados locais: publicId existe, mas backendId é null/undefined (ainda não sincronizados)
 * Para pets do backend: ambos publicId e backendId existem
 *
 * Sem estado global: cada ID é calculado dinamicamente a partir do localStorage
 */

const PUBLIC_ID_MAPPING_KEY = 'central-pet:public-id-mapping';

export interface PublicIdMapping {
  publicId: number; // ID sequencial amigável para URLs
  backendId?: string; // UUID do backend (undefined para pets locais não sincronizados)
  slug?: string; // Opcional: nome-do-pet para URLs semânticas
}

/**
 * Retorna todos os mapeamentos salvos
 */
export const getPublicIdMappings = (): PublicIdMapping[] => {
  const stored = window.localStorage.getItem(PUBLIC_ID_MAPPING_KEY);
  return stored ? JSON.parse(stored) : [];
};

/**
 * Calcula o próximo publicId disponível consultando localStorage
 * Considera o máximo ID existente em mapeamentos
 */
const getNextPublicId = (): number => {
  const mappings = getPublicIdMappings();
  if (mappings.length === 0) {
    return 1;
  }
  return Math.max(...mappings.map((m) => m.publicId)) + 1;
};

/**
 * Inicializa contadores de publicId considerando pets locais
 * Garante que novos publicIds começam após o máximo ID local
 * Chamada uma vez ao carregar pets (ex: em usePets)
 */
export const initializeCounterWithLocalPets = (localPetIds: number[]): void => {
  const mappings = getPublicIdMappings();
  const maxMappedId = mappings.length === 0 ? 0 : Math.max(...mappings.map((m) => m.publicId));
  const maxLocalId = localPetIds.length === 0 ? 0 : Math.max(...localPetIds);

  // Se há pets locais com IDs maiores que o mapping, precisamos "preencher" o gap
  // Garante que publicIds sequenciais não colidem com IDs locais
  const gapEnd = Math.max(maxMappedId, maxLocalId);

  if (gapEnd > maxMappedId) {
    // Cria mapeamentos "de preenchimento" para reservar IDs
    for (let i = maxMappedId + 1; i <= gapEnd; i++) {
      const existing = mappings.find((m) => m.publicId === i);
      if (!existing) {
        // Reserva o ID sem associar a um backendId (ainda)
        mappings.push({ publicId: i });
      }
    }
    window.localStorage.setItem(PUBLIC_ID_MAPPING_KEY, JSON.stringify(mappings));
  }
};

/**
 * Salva um novo mapeamento publicId <-> backendId (opcional)
 * Se backendId não for fornecido, o pet é considerado local/mockado
 */
export const savePublicIdMapping = (backendId?: string, slug?: string): number => {
  const mappings = getPublicIdMappings();

  // Verifica se já existe mapeamento para este backendId (se fornecido)
  if (backendId) {
    const existing = mappings.find((m) => m.backendId === backendId);
    if (existing) {
      return existing.publicId;
    }
  }

  // Calcula novo publicId dinamicamente
  const publicId = getNextPublicId();

  const newMapping: PublicIdMapping = { publicId, ...(backendId && { backendId }), slug };
  mappings.push(newMapping);

  window.localStorage.setItem(PUBLIC_ID_MAPPING_KEY, JSON.stringify(mappings));
  return publicId;
};

/**
 * Salva múltiplos mapeamentos de uma só vez (útil para sincronizar com backend)
 * Útil quando recebemos múltiplos pets do backend e queremos atualizar em batch
 */
export const saveBatchPublicIdMappings = (backendIds: string[]): void => {
  const mappings = getPublicIdMappings();
  const existingIds = new Set(mappings.map((m) => m.backendId));

  backendIds.forEach((backendId) => {
    if (!existingIds.has(backendId)) {
      // Calcula novo publicId dinamicamente
      const publicId = getNextPublicId();
      const newMapping: PublicIdMapping = { publicId, backendId };
      mappings.push(newMapping);
      existingIds.add(backendId);
    }
  });

  window.localStorage.setItem(PUBLIC_ID_MAPPING_KEY, JSON.stringify(mappings));
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
};
