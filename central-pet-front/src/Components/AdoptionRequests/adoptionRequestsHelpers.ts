import { AdoptionRequestStatus } from '@/Models/adoption-request-status';
import type { ReceivedAdoptionRequest } from '@/Models/pet';

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
