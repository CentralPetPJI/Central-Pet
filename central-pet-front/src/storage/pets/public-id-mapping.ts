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

const normalizePublicIdMappings = (
  input: unknown,
): { mappings: PublicIdMapping[]; changed: boolean } => {
  if (!Array.isArray(input)) {
    return { mappings: [], changed: input !== undefined && input !== null };
  }

  let changed = false;

  const sanitized: PublicIdMapping[] = [];
  for (const item of input) {
    if (typeof item !== 'object' || item === null) {
      changed = true;
      continue;
    }

    const maybePublicId = (item as { publicId?: unknown }).publicId;
    if (typeof maybePublicId !== 'number' || !Number.isFinite(maybePublicId)) {
      changed = true;
      continue;
    }

    const publicId = Math.trunc(maybePublicId);
    if (publicId <= 0) {
      changed = true;
      continue;
    }

    const backendId = (item as { backendId?: unknown }).backendId;
    const slug = (item as { slug?: unknown }).slug;

    sanitized.push({
      publicId,
      ...(typeof backendId === 'string' && backendId.trim().length > 0 ? { backendId } : {}),
      ...(typeof slug === 'string' && slug.trim().length > 0 ? { slug } : {}),
    });
  }

  const byBackendId = new Map<string, PublicIdMapping>();
  for (const mapping of sanitized) {
    if (!mapping.backendId) continue;

    const existing = byBackendId.get(mapping.backendId);
    if (!existing) {
      byBackendId.set(mapping.backendId, mapping);
      continue;
    }

    // Duplica backendId: mantém o menor publicId e preserva slug se existir
    changed = true;
    const keep = existing.publicId <= mapping.publicId ? existing : mapping;
    const drop = keep === existing ? mapping : existing;
    if (!keep.slug && drop.slug) {
      keep.slug = drop.slug;
    }
    byBackendId.set(mapping.backendId, keep);
  }

  const merged: PublicIdMapping[] = [];
  for (const mapping of sanitized) {
    if (!mapping.backendId) {
      merged.push(mapping);
      continue;
    }
    if (byBackendId.get(mapping.backendId) === mapping) {
      merged.push(mapping);
    } else {
      changed = true;
    }
  }

  const usedPublicIds = new Set<number>();
  let maxPublicId = 0;
  for (const mapping of merged) {
    maxPublicId = Math.max(maxPublicId, mapping.publicId);
  }

  for (const mapping of merged) {
    if (!usedPublicIds.has(mapping.publicId)) {
      usedPublicIds.add(mapping.publicId);
      continue;
    }

    // Duplica publicId: realoca para o próximo ID disponível
    changed = true;
    let next = maxPublicId + 1;
    while (usedPublicIds.has(next)) {
      next += 1;
    }
    mapping.publicId = next;
    usedPublicIds.add(next);
    maxPublicId = Math.max(maxPublicId, next);
  }

  merged.sort((a, b) => a.publicId - b.publicId);
  return { mappings: merged, changed };
};

const getNextPublicIdFromMappings = (mappings: PublicIdMapping[]): number => {
  if (mappings.length === 0) return 1;
  return Math.max(...mappings.map((m) => m.publicId)) + 1;
};

/**
 * Retorna todos os mapeamentos salvos
 */
export const getPublicIdMappings = (): PublicIdMapping[] => {
  const stored = window.localStorage.getItem(PUBLIC_ID_MAPPING_KEY);
  if (!stored) return [];

  try {
    const parsed: unknown = JSON.parse(stored);
    const normalized = normalizePublicIdMappings(parsed);
    if (normalized.changed) {
      window.localStorage.setItem(PUBLIC_ID_MAPPING_KEY, JSON.stringify(normalized.mappings));
    }
    return normalized.mappings;
  } catch {
    window.localStorage.removeItem(PUBLIC_ID_MAPPING_KEY);
    return [];
  }
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
  const publicId = getNextPublicIdFromMappings(mappings);

  const newMapping: PublicIdMapping = { publicId, ...(backendId && { backendId }), slug };
  mappings.push(newMapping);

  window.localStorage.setItem(PUBLIC_ID_MAPPING_KEY, JSON.stringify(mappings));
  return publicId;
};

/**
 * Atualiza um mapeamento existente para adicionar backendId
 * Útil para quando um pet local é sincronizado com o backend
 */
export const updatePublicIdMapping = (publicId: number, backendId: string, slug?: string): void => {
  const mappings = getPublicIdMappings();

  // Verifica se já existe outro mapeamento com este backendId
  const existingWithBackendId = mappings.find((m) => m.backendId === backendId);
  if (existingWithBackendId && existingWithBackendId.publicId !== publicId) {
    // Há duplicação: remove o mapeamento antigo e mantém o publicId atual
    const index = mappings.findIndex((m) => m.backendId === backendId);
    if (index !== -1) mappings.splice(index, 1);
  }

  // Atualiza o mapeamento específico
  const mapping = mappings.find((m) => m.publicId === publicId);
  if (mapping) {
    mapping.backendId = backendId;
    if (slug) {
      mapping.slug = slug;
    }
  } else {
    mappings.push({ publicId, backendId, ...(slug ? { slug } : {}) });
  }

  window.localStorage.setItem(PUBLIC_ID_MAPPING_KEY, JSON.stringify(mappings));
};

/**
 * Salva múltiplos mapeamentos de uma só vez (útil para sincronizar com backend)
 * Útil quando recebemos múltiplos pets do backend e queremos atualizar em batch
 *
 * Agora também procura por pets locais (sem backendId) que já têm um publicId
 * e os atualiza com o backendId em vez de criar duplicatas
 */
export const saveBatchPublicIdMappings = (backendIds: string[]): void => {
  const mappings = getPublicIdMappings();
  const existingIds = new Set(mappings.map((m) => m.backendId).filter(Boolean));

  backendIds.forEach((backendId) => {
    if (!existingIds.has(backendId)) {
      // Verifica se há mapeamento local (sem backendId) que pode ser atualizado
      // Isto evita duplicação quando um pet local é sincronizado com o backend
      const localMapping = mappings.find((m) => !m.backendId);

      if (localMapping) {
        // Atualiza o mapeamento existente
        localMapping.backendId = backendId;
      } else {
        // Cria novo mapeamento se não houver local disponível
        const publicId = getNextPublicIdFromMappings(mappings);
        const newMapping: PublicIdMapping = { publicId, backendId };
        mappings.push(newMapping);
      }

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
