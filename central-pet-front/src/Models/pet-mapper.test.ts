import { describe, expect, it } from 'vitest';
import { mapPetApiResponseToPetListItem, mapPetApiResponseToRegisterFormData } from './pet-mapper';

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
      tutor: 'ONG Patas do Centro',
      shelter: 'Abrigo Central',
      city: 'São Paulo',
      state: 'SP',
      contact: '(11) 99999-0000',
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
    });

    expect(mapped).toEqual({
      id: 'pet-1',
      name: 'Luna',
      species: 'cat',
      breed: 'SRD',
      city: 'São Paulo',
      state: 'SP',
      adoptionStatus: 'AVAILABLE',
    });
  });

  it('mantem city e state apenas como valores de exibicao do formulario', () => {
    const mapped = mapPetApiResponseToRegisterFormData({
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
      tutor: 'ONG Patas do Centro',
      shelter: 'Abrigo Central',
      city: 'Sao Paulo',
      state: 'SP',
      contact: '(11) 99999-0000',
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
    });

    expect(mapped.city).toBe('Sao Paulo');
    expect(mapped.state).toBe('SP');
    expect(mapped.contact).toBe('(11) 99999-0000');
  });
});
