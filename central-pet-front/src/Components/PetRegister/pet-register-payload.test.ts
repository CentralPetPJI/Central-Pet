import { describe, expect, it } from 'vitest';
import {
  buildPetSubmitPayload,
  isProfileLocationComplete,
  resolvePersonalitySelection,
} from '@/Components/PetRegister/pet-register-payload';
import { petPersonalityOptions } from '@/storage/pets';

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
        vaccinated: true,
        neutered: true,
        dewormed: true,
        needsHealthCare: false,
        physicalLimitation: false,
        visualLimitation: false,
        hearingLimitation: false,
      },
      ['playful'],
    );

    expect(payload).not.toHaveProperty('city');
    expect(payload).not.toHaveProperty('state');
    expect(payload).not.toHaveProperty('tutor');
    expect(payload).not.toHaveProperty('shelter');
    expect(payload).not.toHaveProperty('contact');
    expect(payload).not.toHaveProperty('sourceType');
    expect(payload).not.toHaveProperty('sourceName');
    expect(payload.breed).toBe('SRD');
  });

  it('bloqueia publicacao quando falta localizacao no perfil', () => {
    expect(isProfileLocationComplete({ city: 'Campinas', state: 'SP' })).toBe(true);
    expect(isProfileLocationComplete({ city: 'Campinas', state: '' })).toBe(false);
    expect(isProfileLocationComplete({ city: '', state: 'SP' })).toBe(false);
  });

  it('remove personalidade conflitante ao selecionar uma nova opcao', () => {
    expect(resolvePersonalitySelection(['calm', 'friendly'], 'energetic', petPersonalityOptions))
      .toEqual(['friendly', 'energetic']);
  });
});
