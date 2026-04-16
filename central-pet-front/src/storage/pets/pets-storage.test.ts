import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildPetFromRegisterForm,
  buildRegisterFormDataFromPet,
  getPetById,
  getPetProfileById,
  getStoredPets,
  initialPetRegisterFormData,
  normalizePetRegisterFormData,
  petRegisterFormSchema,
  petsStorageKey,
  savePet,
  getBackendIdFromPublic,
  updatePublicIdMapping,
  initializeCounterWithLocalPets,
} from '@/storage/pets';

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

  it('salva e recupera pet, perfil e mapeamento de id com novo sistema', () => {
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

    // Usa o novo sistema de public-id-mapping
    // Primeiro precisa inicializar o mapeamento para o ID 123 existir
    initializeCounterWithLocalPets([123]);

    // Agora atualiza com o backendId
    updatePublicIdMapping(123, 'backend-uuid-123');

    expect(getPetById(123)).toMatchObject({
      id: 123,
      name: 'Nina',
      responsibleUserId: 'user-2',
    });
    expect(getPetProfileById(123)).toMatchObject({
      id: 123,
      selectedPersonalities: ['playful'],
    });

    // Verifica o mapeamento no novo sistema
    expect(getBackendIdFromPublic(123)).toBe('backend-uuid-123');
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
      sex: 'Femea',
      size: 'Grande',
    });
  });

  it('normaliza dados parciais e valida o schema do formulario', () => {
    const normalized = normalizePetRegisterFormData({
      name: 'Mia',
      galleryPhotos: ['https://example.com/mia-1.png'],
      responsibleUserId: 'user-1',
      sourceType: 'ONG',
      sourceName: 'ONG Mia',
      age: '2 anos',
      species: 'dog',
      breed: 'SRD',
      sex: 'Femea',
      size: 'Medio',
      microchipped: true,
      tutor: 'ONG Mia',
      shelter: 'Abrigo Mia',
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
    });

    expect(normalized.profilePhoto).toBe(initialPetRegisterFormData.profilePhoto);
    expect(normalized.galleryPhotos).toEqual(['https://example.com/mia-1.png']);
    expect(petRegisterFormSchema.safeParse(normalized).success).toBe(true);
  });
});
