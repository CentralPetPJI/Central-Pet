import { describe, expect, it } from '@jest/globals';
import { mockPets } from '@/mocks';
import { createPetRecordFromMockPet, mapPetRecordToPersistence } from './pet-record.mapper';

describe('pet record mapper', () => {
  it('normaliza o mock pet para o record interno', () => {
    const record = createPetRecordFromMockPet(mockPets[1]);

    expect(record).toMatchObject({
      id: '2',
      species: 'CAT',
      sex: 'FEMALE',
      size: 'MEDIUM',
      adoptionStatus: 'AVAILABLE',
      sourceType: 'ONG',
      sourceName: 'ONG Patas do Centro',
    });
  });

  it('preserva o record ao preparar persistencia', () => {
    const record = createPetRecordFromMockPet(mockPets[1]);

    expect(mapPetRecordToPersistence(record)).toEqual(record);
  });
});
