import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { mockPets, type MockPet } from '../../mocks/pets.mock';

const normalizeSpecies = (species: string): MockPet['species'] =>
  species === 'CAT' ? 'CAT' : 'DOG';

const normalizeSize = (size?: string): MockPet['size'] => {
  if (size === 'SMALL' || size === 'MEDIUM' || size === 'LARGE') {
    return size;
  }

  return undefined;
};

const normalizeSex = (sex?: string): MockPet['sex'] => {
  if (sex === 'MALE' || sex === 'FEMALE') {
    return sex;
  }

  return undefined;
};

const normalizeAdoptionStatus = (status?: string): MockPet['adoptionStatus'] =>
  status === 'IN_PROCESS' || status === 'ADOPTED' || status === 'UNAVAILABLE'
    ? status
    : 'AVAILABLE';

@Injectable()
export class PetsService {
  private readonly pets: MockPet[] = [...mockPets];

  create(createPetDto: CreatePetDto) {
    const now = new Date().toISOString();
    const nextId =
      this.pets.reduce((highestId, pet) => Math.max(highestId, pet.id), 0) + 1;

    const pet: MockPet = {
      id: nextId,
      name: createPetDto.name,
      species: normalizeSpecies(createPetDto.species),
      breed: createPetDto.breed,
      ageMonths: createPetDto.ageMonths,
      size: normalizeSize(createPetDto.size),
      sex: normalizeSex(createPetDto.sex),
      color: createPetDto.color,
      description: createPetDto.description,
      vaccinated: createPetDto.vaccinated ?? false,
      neutered: createPetDto.neutered ?? false,
      dewormed: createPetDto.dewormed ?? false,
      adoptionStatus: normalizeAdoptionStatus(createPetDto.adoptionStatus),
      city: createPetDto.city,
      state: createPetDto.state,
      responsibleUserId: createPetDto.responsibleUserId ?? '',
      createdAt: now,
      updatedAt: now,
    };

    this.pets.push(pet);

    return {
      message: 'Pet created successfully',
      data: pet,
    };
  }

  findAll(userId?: string) {
    // Se userId for fornecido, filtra pets desse usuário
    const filteredPets = userId
      ? this.pets.filter((pet) => pet.responsibleUserId === userId)
      : this.pets;

    return {
      message: 'Pets retrieved successfully',
      data: filteredPets,
    };
  }

  findOne(id: string | number) {
    const petId = Number(id);

    if (!Number.isFinite(petId)) {
      throw new NotFoundException(`Pet with id "${id}" not found`);
    }

    const pet = this.pets.find((item) => item.id === petId);

    if (!pet) {
      throw new NotFoundException(`Pet with id "${id}" not found`);
    }

    return {
      message: 'Pet retrieved successfully',
      data: pet,
    };
  }

  update(id: string | number, updatePetDto: UpdatePetDto) {
    const petId = Number(id);

    if (!Number.isFinite(petId)) {
      throw new NotFoundException(`Pet with id "${id}" not found`);
    }

    const index = this.pets.findIndex((item) => item.id === petId);

    if (index === -1) {
      throw new NotFoundException(`Pet with id "${id}" not found`);
    }

    const updatedPet: MockPet = {
      ...this.pets[index],
      id: this.pets[index].id,
      createdAt: this.pets[index].createdAt,
      responsibleUserId: this.pets[index].responsibleUserId,
      updatedAt: new Date().toISOString(),
      name: updatePetDto.name ?? this.pets[index].name,
      species: updatePetDto.species
        ? normalizeSpecies(updatePetDto.species)
        : this.pets[index].species,
      breed: updatePetDto.breed ?? this.pets[index].breed,
      ageMonths: updatePetDto.ageMonths ?? this.pets[index].ageMonths,
      size: updatePetDto.size
        ? normalizeSize(updatePetDto.size)
        : this.pets[index].size,
      sex: updatePetDto.sex
        ? normalizeSex(updatePetDto.sex)
        : this.pets[index].sex,
      color: updatePetDto.color ?? this.pets[index].color,
      description: updatePetDto.description ?? this.pets[index].description,
      vaccinated: updatePetDto.vaccinated ?? this.pets[index].vaccinated,
      neutered: updatePetDto.neutered ?? this.pets[index].neutered,
      dewormed: updatePetDto.dewormed ?? this.pets[index].dewormed,
      adoptionStatus: updatePetDto.adoptionStatus
        ? normalizeAdoptionStatus(updatePetDto.adoptionStatus)
        : this.pets[index].adoptionStatus,
      city: updatePetDto.city ?? this.pets[index].city,
      state: updatePetDto.state ?? this.pets[index].state,
    };

    this.pets[index] = updatedPet;

    return {
      message: 'Pet updated successfully',
      data: updatedPet,
    };
  }
}
