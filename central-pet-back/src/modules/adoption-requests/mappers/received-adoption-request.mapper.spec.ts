import { describe, expect, it } from '@jest/globals';
import { mapToReceivedAdoptionRequest } from '../models/received-adoption-request';
import type { AdoptionRequestRecord } from '../models/adoption-request-record';

describe('received adoption request mapper', () => {
  it('normaliza o record de solicitacao recebida', () => {
    const mockRequest: AdoptionRequestRecord = {
      id: 'req-test-001',
      petId: 'pet-123',
      adopterId: 'adopter-789',
      responsibleUserId: 'user-456',
      adopterContactShareConsent: true,
      message: 'Quero adotar!',
      status: 'pending',
      note: null,
      requestedAt: new Date('2026-03-15T10:30:00.000Z'),
      updatedAt: new Date('2026-03-15T10:30:00.000Z'),
    };

    const mapped = mapToReceivedAdoptionRequest({
      request: mockRequest,
      pet: {
        id: 'pet-123',
        name: 'Buddy',
        species: 'DOG',
        city: 'São Paulo',
        state: 'SP',
        responsibleUserId: 'user-456',
        sourceType: 'ONG',
        sourceName: 'ONG Patas do Centro',
      },
      adopter: {
        id: 'adopter-789',
        name: 'Rafael Lima',
        city: 'São Paulo',
        state: 'SP',
      },
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
      adopterContactShareConsent: true,
      status: 'pending',
      message: 'Quero adotar!',
    });
  });
});
