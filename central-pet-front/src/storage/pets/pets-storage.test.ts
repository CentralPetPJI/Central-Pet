import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildPetFromRegisterForm,
  buildRegisterFormDataFromPet,
  getBackendId,
  getLocalId,
  getPetById,
  getPetProfileById,
  getStoredPets,
  initialPetRegisterFormData,
  isPetSynced,
  normalizePetRegisterFormData,
  petRegisterFormSchema,
  petsStorageKey,
  saveIdMapping,
  savePet,
} from '@/storage/pets';

describe('pet storage helpers', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('recupera os pets padrao e limpa dados invalidos', () => {
    window.localStorage.setItem(petsStorageKey, 'not-json');

    const pets = getStoredPets();

    expect(pets.length).toBeGreaterThan(0);
    expect(window.localStorage.getItem(petsStorageKey)).toBeNull();
  });

  it('monta um pet com as personalidades selecionadas e o usuario responsavel', () => {
    const pet = buildPetFromRegisterForm(
      {
        ...initialPetRegisterFormData,
        name: 'Luna',
        species: 'dog',
        breed: 'SRD',
        age: '2 anos',
        sex: 'Femea',
        size: 'Grande',
        profilePhoto: 'https://example.com/luna.png',
      },
      ['curious', 'friendly'],
      99,
      'user-1',
    );

    expect(pet).toMatchObject({
      id: 99,
      name: 'Luna',
      species: 'dog',
      photo: 'https://example.com/luna.png',
      behavioralCharacteristics: 'Curioso, Sociavel',
      responsibleUserId: 'user-1',
    });
  });

  it('salva e recupera pet, perfil e mapeamento de id', () => {
    const pet = buildPetFromRegisterForm(
      {
        ...initialPetRegisterFormData,
        name: 'Nina',
        species: 'cat',
        breed: 'Siamês',
        age: '4 anos',
        sex: 'Macho',
        size: 'Pequeno',
      },
      ['playful'],
      123,
      'user-2',
    );

    savePet(pet, {
      id: 123,
      formData: normalizePetRegisterFormData({
        ...initialPetRegisterFormData,
        name: 'Nina',
      }),
      selectedPersonalities: ['playful'],
    });
    saveIdMapping(123, 'backend-123');

    expect(getPetById(123)).toMatchObject({
      id: 123,
      name: 'Nina',
      responsibleUserId: 'user-2',
    });
    expect(getPetProfileById(123)).toMatchObject({
      id: 123,
      selectedPersonalities: ['playful'],
    });
    expect(getBackendId(123)).toBe('backend-123');
    expect(getLocalId('backend-123')).toBe(123);
    expect(isPetSynced(123)).toBe(true);
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
    });

    expect(formData).toMatchObject({
      name: 'Thor',
      species: 'dog',
      profilePhoto: 'https://example.com/thor.png',
      sex: 'Femea',
      size: 'Grande',
    });
  });

  it('normaliza dados parciais e valida o schema do formulario', () => {
    const normalized = normalizePetRegisterFormData({
      name: 'Mia',
      galleryPhotos: ['https://example.com/mia-1.png'],
    });

    expect(normalized.profilePhoto).toBe(initialPetRegisterFormData.profilePhoto);
    expect(normalized.galleryPhotos).toEqual(['https://example.com/mia-1.png']);
    expect(petRegisterFormSchema.safeParse(normalized).success).toBe(true);
  });
});
