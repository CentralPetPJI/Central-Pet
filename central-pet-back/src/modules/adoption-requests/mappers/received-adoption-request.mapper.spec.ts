import { describe, expect, it } from '@jest/globals';
import { mapToReceivedAdoptionRequest } from '../models/received-adoption-request';
import type { MockAdoptionRequest } from '@/mocks';

describe('received adoption request mapper', () => {
  it('normaliza o record de solicitacao recebida', () => {
    const mockRequest: MockAdoptionRequest = {
      id: 'req-test-001',
      petId: 'pet-123',
      petSnapshot: {
        id: 'pet-123',
        name: 'Buddy',
        species: 'DOG',
        city: 'São Paulo',
        state: 'SP',
        responsibleUserId: 'user-456',
        sourceType: 'ONG',
        sourceName: 'ONG Patas do Centro',
      },
      adopterId: 'adopter-789',
      adopterSnapshot: {
        id: 'adopter-789',
        name: 'Rafael Lima',
        city: 'São Paulo',
        state: 'SP',
      },
      message: 'Quero adotar!',
      status: 'PENDING',
      requestedAt: '2026-03-15T10:30:00.000Z',
      updatedAt: '2026-03-15T10:30:00.000Z',
    };

    const mapped = mapToReceivedAdoptionRequest({
      request: mockRequest,
      pet: mockRequest.petSnapshot!,
      adopter: mockRequest.adopterSnapshot!,
    });

    expect(mapped).toMatchObject({
      id: 'req-test-001',
      pet: {
        id: 'pet-123',
        name: 'Buddy',
        species: 'DOG',
        city: 'São Paulo',
        state: 'SP',
        sourceType: 'ONG',
        sourceName: 'ONG Patas do Centro',
      },
      adopter: {
        id: 'adopter-789',
        name: 'Rafael Lima',
        city: 'São Paulo',
        state: 'SP',
      },
      status: 'PENDING',
      message: 'Quero adotar!',
    });
  });
});
