import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { PersonalityTraitsService } from '../personality-traits/personality-traits.service';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

describe('PetsService', () => {
  let service: PetsService;

  beforeEach(() => {
    service = new PetsService(new PersonalityTraitsService());
  });

  const makeCreateDto = (): CreatePetDto => ({
    profilePhoto: 'data:image/png;base64,abc',
    galleryPhotos: ['data:image/png;base64,def'],
    name: 'Luna',
    age: '3 anos',
    species: 'dog',
    breed: 'SRD',
    sex: 'Femea',
    size: 'Medio',
    microchipped: true,
    tutor: 'ONG Patas do Centro',
    shelter: 'Abrigo Reencontro',
    city: 'Sao Paulo - SP',
    contact: '(11) 99999-0000',
    vaccinated: true,
    neutered: true,
    dewormed: true,
    needsHealthCare: false,
    physicalLimitation: false,
    visualLimitation: false,
    hearingLimitation: false,
    selectedPersonalities: ['playful', 'friendly'],
  });

  it('should create a pet successfully', () => {
    const result = service.create(makeCreateDto());

    expect(result.message).toBe('Pet created successfully');
    expect(result.data.id).toBeDefined();
    expect(result.data.name).toBe('Luna');
    expect(result.data.species).toBe('dog');
    expect(result.data.selectedPersonalities).toEqual(['playful', 'friendly']);
    expect(result.data.createdAt).toBeDefined();
    expect(result.data.updatedAt).toBeDefined();
  });

  it('should create a pet with empty selectedPersonalities when omitted', () => {
    const dto: CreatePetDto = {
      ...makeCreateDto(),
      selectedPersonalities: undefined,
    };

    const result = service.create(dto);

    expect(result.data.selectedPersonalities).toEqual([]);
  });

  it('should reject invalid personality traits on create', () => {
    const dto: CreatePetDto = {
      ...makeCreateDto(),
      selectedPersonalities: ['playful', 'invalid-trait'],
    };

    expect(() => service.create(dto)).toThrow(BadRequestException);
  });

  it('should list all created pets', () => {
    service.create(makeCreateDto());

    const result = service.findAll();

    expect(result.message).toBe('Pets retrieved successfully');
    expect(result.data.length).toBe(1);
  });

  it('should find one existing pet', () => {
    const created = service.create(makeCreateDto());

    const found = service.findOne(created.data.id);

    expect(found.message).toBe('Pet retrieved successfully');
    expect(found.data.id).toBe(created.data.id);
    expect(found.data.name).toBe('Luna');
  });

  it('should throw NotFoundException when pet does not exist on findOne', () => {
    expect(() => service.findOne('missing-id')).toThrow(NotFoundException);
  });

  it('should update an existing pet and preserve other fields', () => {
    const created = service.create(makeCreateDto());

    const dto: UpdatePetDto = {
      name: 'Jones',
      selectedPersonalities: ['playful', 'friendly'],
    };

    const updated = service.update(created.data.id, dto);

    expect(updated.message).toBe('Pet updated successfully');
    expect(updated.data.id).toBe(created.data.id);
    expect(updated.data.name).toBe('Jones');
    expect(updated.data.selectedPersonalities).toEqual(['playful', 'friendly']);

    expect(updated.data.profilePhoto).toBe(created.data.profilePhoto);
    expect(updated.data.species).toBe(created.data.species);
    expect(updated.data.breed).toBe(created.data.breed);
    expect(updated.data.city).toBe(created.data.city);
    expect(updated.data.contact).toBe(created.data.contact);

    expect(updated.data.updatedAt).toBeDefined();
    expect(new Date(updated.data.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(created.data.updatedAt).getTime(),
    );
  });

  it('should reject invalid personality traits on update', () => {
    const created = service.create(makeCreateDto());

    const dto: UpdatePetDto = {
      selectedPersonalities: ['invalid-trait'],
    };

    expect(() => service.update(created.data.id, dto)).toThrow(
      BadRequestException,
    );
  });

  it('should throw NotFoundException when pet does not exist on update', () => {
    expect(() => service.update('missing-id', { name: 'Novo Nome' })).toThrow(
      NotFoundException,
    );
  });

  it('should preserve selectedPersonalities when update payload omits the field', () => {
    const created = service.create(makeCreateDto());

    const dto: UpdatePetDto = {
      name: 'Luna Renomeada',
    };

    const updated = service.update(created.data.id, dto);

    expect(updated.data.name).toBe('Luna Renomeada');
    expect(updated.data.selectedPersonalities).toEqual(
      created.data.selectedPersonalities,
    );
  });
});
