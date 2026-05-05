import { AdoptionRequestStatus } from '@/Models/adoption-request-status';
import type { ReceivedAdoptionRequest } from '@/Models/pet';
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

/**
 * Ordena solicitações de adoção priorizando PENDING no topo.
 * Dentro do mesmo grupo de status, ordena por data mais recente primeiro.
 */
export function sortAdoptionRequests(
  requests: ReceivedAdoptionRequest[],
): ReceivedAdoptionRequest[] {
  return [...requests].sort((a, b) => {
    const aPending = a.status === AdoptionRequestStatus.PENDING ? 0 : 1;
    const bPending = b.status === AdoptionRequestStatus.PENDING ? 0 : 1;
    if (aPending !== bPending) return aPending - bPending;
    return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
  });
}
