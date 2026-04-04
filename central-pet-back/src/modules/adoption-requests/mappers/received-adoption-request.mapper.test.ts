import { describe, expect, it } from '@jest/globals';
import { mockAdoptionRequests, mockPets, mockUsers } from '@/mocks';
import { mapToReceivedAdoptionRequest } from '../models/received-adoption-request';

describe('received adoption request mapper', () => {
  it('normaliza o record de solicitacao recebida', () => {
    const mapped = mapToReceivedAdoptionRequest({
      request: mockAdoptionRequests[0],
      pet: mockPets[0],
      adopter: mockUsers[3],
    });

    expect(mapped).toMatchObject({
      id: 'req-001',
      pet: {
        id: 1,
        name: 'Buddy',
        sourceType: 'ONG',
        sourceName: 'ONG Patas do Centro',
      },
      adopter: {
        id: mockUsers[3].id,
        name: mockUsers[3].fullName,
      },
      status: 'PENDING',
    });
  });
});
