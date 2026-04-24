import { getPublicIdFromBackend } from '@/storage/pets';

/**
 * Retorna o ID apropriado para uso em rotas locais.
 * Para pets que vieram do backend com UUID, tenta encontrar o publicId.
 * Para pets mock (que já têm ID numérico), retorna o próprio ID.
 */
export function getPetRouteId(petId: string | number): string | number {
  if (typeof petId === 'number') {
    return petId;
  }

  const publicId = getPublicIdFromBackend(petId);
  return publicId ?? petId;
}

export function formatRequestDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date));
}
