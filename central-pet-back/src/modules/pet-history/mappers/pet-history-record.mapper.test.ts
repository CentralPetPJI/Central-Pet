import { describe, expect, it } from '@jest/globals';
import { mockPets, mockUsers, mockUserIds } from '@/mocks';
import {
  mapToPetHistoryRecord,
  resolvePetHistoryPetName,
  resolvePetHistoryUser,
} from '../models/pet-history-record';

describe('pet history record mapper', () => {
  it('normaliza o record de historico de pet', () => {
    const mapped = mapToPetHistoryRecord({
      id: 'hist-001',
      petId: 'pet-1',
      petName: 'Buddy',
      userId: mockUserIds.ONG_PATAS_DO_CENTRO,
      fullName: 'ONG Patas do Centro',
      eventName: 'PET_REGISTERED',
      createdAt: '2026-03-10T10:00:00.000Z',
    });

    expect(mapped).toMatchObject({
      id: 'hist-001',
      pet: {
        id: 'pet-1',
        name: 'Buddy',
      },
      user: {
        id: mockUserIds.ONG_PATAS_DO_CENTRO,
        fullName: 'ONG Patas do Centro',
      },
      eventName: 'PET_REGISTERED',
    });
  });

  it('resolve nomes com fallback quando os mocks nao existem', () => {
    expect(resolvePetHistoryPetName(mockPets[0], 'Fallback')).toBe('Buddy');
    expect(resolvePetHistoryUser(mockUsers[0], 'user-x', 'Fallback')).toEqual({
      id: mockUsers[0].id,
      fullName: mockUsers[0].fullName,
    });
  });
});
