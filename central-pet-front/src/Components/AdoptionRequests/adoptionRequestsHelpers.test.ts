import { describe, expect, it } from 'vitest';
import { sortAdoptionRequests } from '@/Components/AdoptionRequests/adoptionRequestsHelpers';
import { AdoptionRequestStatus } from '@/Models/adoption-request-status';
import type { ReceivedAdoptionRequest } from '@/Models/pet';

function makeRequest(
  id: string,
  status: AdoptionRequestStatus,
  requestedAt: string,
): ReceivedAdoptionRequest {
  return {
    id,
    pet: {
      id: 'pet-1',
      name: 'Pet',
      species: 'DOG',
      city: 'SP',
      state: 'SP',
      responsibleUserId: 'user-1',
      sourceType: 'PESSOA_FISICA',
      sourceName: 'Fulano',
    },
    adopter: { id: 'a1', name: 'Adotante', city: 'SP', state: 'SP' },
    message: 'msg',
    responsibleContactShareConsent: false,
    adopterContactShareConsent: false,
    status,
    requestedAt,
    updatedAt: requestedAt,
  };
}

describe('sortAdoptionRequests', () => {
  it('coloca PENDING antes dos outros status', () => {
    const requests = [
      makeRequest('1', AdoptionRequestStatus.APPROVED, '2025-01-03T00:00:00Z'),
      makeRequest('2', AdoptionRequestStatus.PENDING, '2025-01-01T00:00:00Z'),
      makeRequest('3', AdoptionRequestStatus.REJECTED, '2025-01-02T00:00:00Z'),
    ];

    const result = sortAdoptionRequests(requests);
    expect(result[0].status).toBe(AdoptionRequestStatus.PENDING);
  });

  it('ordena por data mais recente dentro do mesmo grupo de status', () => {
    const requests = [
      makeRequest('1', AdoptionRequestStatus.APPROVED, '2025-01-01T00:00:00Z'),
      makeRequest('2', AdoptionRequestStatus.APPROVED, '2025-01-03T00:00:00Z'),
      makeRequest('3', AdoptionRequestStatus.APPROVED, '2025-01-02T00:00:00Z'),
    ];

    const result = sortAdoptionRequests(requests);
    expect(result[0].id).toBe('2'); // mais recente primeiro
    expect(result[1].id).toBe('3');
    expect(result[2].id).toBe('1');
  });

  it('não muta o array original', () => {
    const requests = [
      makeRequest('1', AdoptionRequestStatus.APPROVED, '2025-01-03T00:00:00Z'),
      makeRequest('2', AdoptionRequestStatus.PENDING, '2025-01-01T00:00:00Z'),
    ];
    const original = [...requests];

    sortAdoptionRequests(requests);

    expect(requests[0].id).toBe(original[0].id);
  });

  it('lida com array vazio', () => {
    expect(sortAdoptionRequests([])).toEqual([]);
  });

  it('mantém PENDING antes de CANCELLED', () => {
    const requests = [
      makeRequest('1', AdoptionRequestStatus.CANCELLED, '2025-01-05T00:00:00Z'),
      makeRequest('2', AdoptionRequestStatus.PENDING, '2025-01-01T00:00:00Z'),
    ];

    const result = sortAdoptionRequests(requests);
    expect(result[0].status).toBe(AdoptionRequestStatus.PENDING);
  });
});
