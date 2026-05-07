import { describe, expect, it } from 'vitest';
import { mapPetApiResponseToPetListItem } from './pet-mapper';

describe('mapPetApiResponseToPetListItem', () => {
  it('normaliza o item da API e aplica status padrão quando ausente', () => {
    const mapped = mapPetApiResponseToPetListItem({
      id: 'pet-1',
      profilePhoto: 'https://example.com/pet.png',
      galleryPhotos: [],
      name: 'Luna',
      age: '3 anos',
      species: 'cat',
      breed: 'SRD',
      sex: 'female',
      size: 'medium',
      microchipped: false,
      city: 'Sao Paulo',
      state: 'SP',
      vaccinated: true,
      neutered: true,
      dewormed: true,
      needsHealthCare: false,
      physicalLimitation: false,
      visualLimitation: false,
      hearingLimitation: false,
      selectedPersonalities: [],
      responsibleUserId: 'user-1',
      sourceType: 'ONG',
      sourceName: 'ONG Patas do Centro',
      createdAt: '2026-04-04T00:00:00.000Z',
      updatedAt: '2026-04-04T00:00:00.000Z',
      deleted: false,
    });

    expect(mapped).toEqual({
      id: 'pet-1',
      name: 'Luna',
      species: 'cat',
      breed: 'SRD',
      city: 'Sao Paulo',
      state: 'SP',
      adoptionStatus: 'AVAILABLE',
    });
  });
});
