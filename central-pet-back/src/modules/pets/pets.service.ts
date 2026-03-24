import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

type PetRecord = {
  id: string;
  name: string;
  species: string;
  breed?: string;
  ageMonths?: number;
  size?: string;
  sex?: string;
  color?: string;
  description?: string;
  vaccinated: boolean;
  neutered: boolean;
  dewormed: boolean;
  adoptionStatus: string;
  city?: string;
  state?: string;
  responsibleUserId: string;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class PetsService {
  private readonly pets: PetRecord[] = [];

  create(createPetDto: CreatePetDto) {
    const now = new Date().toISOString();

    const pet: PetRecord = {
      id: randomUUID(),
      name: createPetDto.name,
      species: createPetDto.species,
      breed: createPetDto.breed,
      ageMonths: createPetDto.ageMonths,
      size: createPetDto.size,
      sex: createPetDto.sex,
      color: createPetDto.color,
      description: createPetDto.description,
      vaccinated: createPetDto.vaccinated ?? false,
      neutered: createPetDto.neutered ?? false,
      dewormed: createPetDto.dewormed ?? false,
      adoptionStatus: createPetDto.adoptionStatus ?? 'AVAILABLE',
      city: createPetDto.city,
      state: createPetDto.state,
      responsibleUserId: createPetDto.responsibleUserId,
      createdAt: now,
      updatedAt: now,
    };

    this.pets.push(pet);

    return {
      message: 'Pet created successfully',
      data: pet,
    };
  }

  findAll() {
    return {
      message: 'Pets retrieved successfully',
      data: this.pets,
    };
  }

  findOne(id: string) {
    const pet = this.pets.find((item) => item.id === id);

    if (!pet) {
      throw new NotFoundException(`Pet with id "${id}" not found`);
    }

    return {
      message: 'Pet retrieved successfully',
      data: pet,
    };
  }

  update(id: string, updatePetDto: UpdatePetDto) {
    const index = this.pets.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new NotFoundException(`Pet with id "${id}" not found`);
    }

    const updatedPet: PetRecord = {
      ...this.pets[index],
      ...updatePetDto,
      id: this.pets[index].id,
      createdAt: this.pets[index].createdAt,
      responsibleUserId: this.pets[index].responsibleUserId,
      updatedAt: new Date().toISOString(),
    };

    this.pets[index] = updatedPet;

    return {
      message: 'Pet updated successfully',
      data: updatedPet,
    };
  }
}
