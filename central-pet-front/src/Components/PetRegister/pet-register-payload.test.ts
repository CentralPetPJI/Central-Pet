import { describe, expect, it } from 'vitest';
import {
  buildPetSubmitPayload,
  isProfileLocationComplete,
} from '@/Components/PetRegister/pet-register-payload';

describe('pet-register-payload', () => {
  it('nao envia city nem state no payload do pet', () => {
    const payload = buildPetSubmitPayload(
      {
        profilePhoto: 'data:image/png;base64,abc',
        galleryPhotos: ['data:image/png;base64,def'],
        name: '  Luna  ',
        age: ' 3 anos ',
        species: 'dog',
        breed: '  ',
        sex: 'female',
        size: 'medium',
        microchipped: true,
        tutor: '  Maria  ',
        shelter: '  Abrigo Central  ',
        city: 'Sao Paulo',
        state: 'SP',
        contact: '  (11) 99999-0000  ',
        vaccinated: true,
        neutered: true,
        dewormed: true,
        needsHealthCare: false,
        physicalLimitation: false,
        visualLimitation: false,
        hearingLimitation: false,
      },
      {
        fullName: 'Maria Silva',
        organizationName: undefined,
        role: 'PESSOA_FISICA',
      },
      ['playful'],
    );

    expect(payload).not.toHaveProperty('city');
    expect(payload).not.toHaveProperty('state');
    expect(payload.breed).toBe('SRD');
    expect(payload.sourceName).toBe('Maria Silva');
  });

  it('bloqueia publicacao quando falta localizacao no perfil', () => {
    expect(isProfileLocationComplete({ city: 'Campinas', state: 'SP' })).toBe(true);
    expect(isProfileLocationComplete({ city: 'Campinas', state: '' })).toBe(false);
    expect(isProfileLocationComplete({ city: '', state: 'SP' })).toBe(false);
  });
});
