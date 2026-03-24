import { beforeEach, describe, expect, it } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

describe('PetsService', () => {
  let service: PetsService;

  beforeEach(() => {
    service = new PetsService();
  });

  const makeCreateDto = (): CreatePetDto => ({
    name: 'Thor',
    species: 'DOG',
    breed: 'Labrador',
    ageMonths: 18,
    size: 'LARGE',
    sex: 'MALE',
    color: 'Caramelo',
    description: 'Cão dócil e brincalhão.',
    vaccinated: true,
    neutered: true,
    dewormed: true,
    adoptionStatus: 'AVAILABLE',
    city: 'Campinas',
    state: 'SP',
    responsibleUserId: '11111111-1111-1111-1111-111111111111',
  });

  it('should create a pet with provided values', () => {
    const result = service.create(makeCreateDto());

    expect(result.message).toBe('Pet created successfully');
    expect(result.data.id).toBeDefined();
    expect(result.data.name).toBe('Thor');
    expect(result.data.species).toBe('DOG');
    expect(result.data.vaccinated).toBe(true);
    expect(result.data.neutered).toBe(true);
    expect(result.data.dewormed).toBe(true);
    expect(result.data.adoptionStatus).toBe('AVAILABLE');
    expect(result.data.createdAt).toBeDefined();
    expect(result.data.updatedAt).toBeDefined();
  });

  it('should apply defaults when optional booleans and adoptionStatus are omitted', () => {
    const dto: CreatePetDto = {
      name: 'Luna',
      species: 'CAT',
      responsibleUserId: '11111111-1111-1111-1111-111111111111',
    };

    const result = service.create(dto);

    expect(result.data.vaccinated).toBe(false);
    expect(result.data.neutered).toBe(false);
    expect(result.data.dewormed).toBe(false);
    expect(result.data.adoptionStatus).toBe('AVAILABLE');
  });

  it('should find one existing pet', () => {
    const created = service.create(makeCreateDto());

    const found = service.findOne(created.data.id);

    expect(found.data.id).toBe(created.data.id);
    expect(found.data.name).toBe('Thor');
  });

  it('should throw NotFoundException when pet does not exist on findOne', () => {
    expect(() => service.findOne('missing-id')).toThrow(NotFoundException);
  });

  it('should update an existing pet and preserve other fields', () => {
    const created = service.create(makeCreateDto());

    const dto: UpdatePetDto = {
      description: 'Atualizado',
      adoptionStatus: 'IN_PROCESS',
    };

    const updated = service.update(created.data.id, dto);

    expect(updated.message).toBe('Pet updated successfully');
    expect(updated.data.id).toBe(created.data.id);
    expect(updated.data.description).toBe('Atualizado');
    expect(updated.data.adoptionStatus).toBe('IN_PROCESS');
    expect(updated.data.name).toBe('Thor');
    expect(updated.data.updatedAt).toBeDefined();
    expect(new Date(updated.data.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(created.data.updatedAt).getTime(),
    );
  });

  it('should throw NotFoundException when pet does not exist on update', () => {
    expect(() => service.update('missing-id', { description: 'x' })).toThrow(
      NotFoundException,
    );
  });
});
