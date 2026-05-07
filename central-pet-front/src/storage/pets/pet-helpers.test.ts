import { afterEach, describe, expect, it } from 'vitest';
import type { PetApiResponse } from '@/Models/pet';
import { clearPublicIdMappings } from './public-id-mapping';
import { mapApiResponseToPet } from './pet-helpers';

const makeApiPet = (selectedPersonalities: string[]): PetApiResponse => ({
  id: 'pet-1',
  profilePhoto: 'https://example.com/luna.png',
  galleryPhotos: [],
  name: 'Luna',
  age: '2 anos',
  species: 'dog',
  breed: 'SRD',
  sex: 'female',
  size: 'medium',
  microchipped: false,
  city: 'São Paulo',
  state: 'SP',
  vaccinated: true,
  neutered: true,
  dewormed: true,
  needsHealthCare: false,
  physicalLimitation: false,
  visualLimitation: false,
  hearingLimitation: false,
  selectedPersonalities,
  responsibleUserId: 'user-1',
  sourceType: 'PESSOA_FISICA',
  sourceName: 'Ana',
  createdAt: '2026-05-07T00:00:00.000Z',
  updatedAt: '2026-05-07T00:00:00.000Z',
  deleted: false,
});

describe('mapApiResponseToPet', () => {
  afterEach(() => {
    clearPublicIdMappings();
  });

  it('exibe os títulos das personalidades em português no card do pet', () => {
    const pet = mapApiResponseToPet(makeApiPet(['playful', 'friendly']), [
      {
        id: 'playful',
        title: 'Brincalhão',
        description: 'Adora interagir.',
        conflictsWith: [],
      },
      {
        id: 'friendly',
        title: 'Sociável',
        description: 'Recebe bem visitas.',
        conflictsWith: [],
      },
    ]);

    expect(pet.behavioralCharacteristics).toBe('Brincalhão, Sociável');
  });
});
