import { beforeEach, describe, expect, it } from 'vitest';
import { buildRegisterFormDataFromPet, getStoredPets, petsStorageKey } from '@/storage/pets';

describe('pet storage helpers', () => {
  /*const _initialPetRegisterFormData: PetRegisterFormData = {
    profilePhoto: dogImage as string,
    galleryPhotos: [],
    name: 'Luna',
    age: '3 anos',
    species: 'dog',
    breed: 'SRD',
    sex: 'female',
    size: 'medium',
    microchipped: true,
    tutor: 'ONG Patas do Centro',
    shelter: 'Abrigo Reencontro',
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
  };*/

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('retorna lista vazia e limpa dados invalidos', () => {
    window.localStorage.setItem(petsStorageKey, 'not-json');

    const pets = getStoredPets();

    expect(pets).toEqual([]);
    expect(window.localStorage.getItem(petsStorageKey)).toBeNull();
  });

  it('reconstrói o form data de um pet existente', () => {
    const formData = buildRegisterFormDataFromPet({
      id: 7,
      name: 'Thor',
      species: 'dog',
      photo: 'https://example.com/thor.png',
      physicalCharacteristics: 'SRD, 3 anos, Femea, porte Grande',
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
      sex: 'male',
      size: 'medium',
    });
  });
});
