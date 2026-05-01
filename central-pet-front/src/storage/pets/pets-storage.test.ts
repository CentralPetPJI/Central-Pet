import { beforeEach, describe, expect, it } from 'vitest';
import { buildRegisterFormDataFromPet, getStoredPets, petsStorageKey } from '@/storage/pets';

describe('pet storage helpers', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('retorna lista vazia e limpa dados invalidos', () => {
    window.localStorage.setItem(petsStorageKey, 'not-json');

    const pets = getStoredPets();

    expect(pets).toEqual([]);
    expect(window.localStorage.getItem(petsStorageKey)).toBeNull();
  });

  it('reconstrói o form data de um pet existente preservando a idade exibida', () => {
    const formData = buildRegisterFormDataFromPet({
      id: 7,
      name: 'Thor',
      species: 'dog',
      photo: 'https://example.com/thor.png',
      physicalCharacteristics: 'SRD, Filhote, Femea, porte Grande',
      behavioralCharacteristics: 'Curioso',
      notes: 'Tutor: ONG Patas do Centro.',
      responsibleUserId: 'user-3',
      sourceType: 'ONG',
      sourceName: 'ONG Patas do Centro',
    });

    expect(formData).toMatchObject({
      name: 'Thor',
      species: 'dog',
      profilePhoto: 'https://example.com/thor.png',
      age: 'Filhote',
      sex: 'male',
      size: 'medium',
    });
  });
});
