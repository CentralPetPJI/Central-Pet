import { describe, expect, it } from '@jest/globals';
import { PetMapper } from './pet-record.mapper';
import {
  PetSpecies,
  PetSex,
  PetSize,
  PetStatus,
  UserRole,
  Pet,
} from '../../../../generated/prisma/client';

describe('PetMapper', () => {
  const mockPrismaPet: Pet = {
    id: '1',
    name: 'Luna',
    ageText: '3 anos',
    species: PetSpecies.DOG,
    breed: 'SRD',
    sex: PetSex.FEMALE,
    size: PetSize.MEDIUM,
    profilePhoto: 'photo.jpg',
    galleryPhotosJson: JSON.stringify(['photo1.jpg', 'photo2.jpg']),
    microchipped: true,
    vaccinated: true,
    neutered: true,
    dewormed: true,
    needsHealthCare: false,
    physicalLimitation: false,
    visualLimitation: false,
    hearingLimitation: false,
    tutor: 'Rafael',
    shelter: 'Abrigo',
    city: 'São Paulo',
    state: 'SP',
    contact: '123456',
    selectedPersonalitiesJson: JSON.stringify(['playful']),
    responsibleUserId: 'user-1',
    sourceType: UserRole.PESSOA_FISICA,
    sourceName: 'Rafael Lima',
    status: PetStatus.AVAILABLE,
    deleted: false,
    createdAt: new Date('2026-04-10T00:00:00Z'),
    updatedAt: new Date('2026-04-10T00:00:00Z'),
  };

  it('deve mapear um Pet do Prisma para o Domínio', () => {
    const record = PetMapper.toDomain(mockPrismaPet as any);

    expect(record).toMatchObject({
      id: '1',
      name: 'Luna',
      species: 'dog',
      sex: 'female',
      size: 'medium',
      galleryPhotos: ['photo1.jpg', 'photo2.jpg'],
      selectedPersonalities: ['playful'],
      adoptionStatus: 'AVAILABLE',
    });
  });

  it('deve mapear espécies para persistência', () => {
    expect(PetMapper.mapSpeciesToPersistence('dog')).toBe(PetSpecies.DOG);
    expect(PetMapper.mapSpeciesToPersistence('CAT')).toBe(PetSpecies.CAT);
    expect(PetMapper.mapSpeciesToPersistence('unknown')).toBe(PetSpecies.DOG);
  });

  it('deve mapear sexo para persistência', () => {
    expect(PetMapper.mapSexToPersistence('female')).toBe(PetSex.FEMALE);
    expect(PetMapper.mapSexToPersistence('MALE')).toBe(PetSex.MALE);
  });

  it('deve mapear tamanho para persistência', () => {
    expect(PetMapper.mapSizeToPersistence('small')).toBe(PetSize.SMALL);
    expect(PetMapper.mapSizeToPersistence('medium')).toBe(PetSize.MEDIUM);
    expect(PetMapper.mapSizeToPersistence('large')).toBe(PetSize.LARGE);
  });
});
