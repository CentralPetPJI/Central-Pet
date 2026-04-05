import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PersonalityTraitsService } from '../personality-traits/personality-traits.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

type PetRecord = {
  id: string;
  profilePhoto: string;
  galleryPhotos: string[];
  name: string;
  age: string;
  species: string;
  breed: string;
  sex: string;
  size: string;
  microchipped: boolean;
  tutor: string;
  shelter: string;
  city: string;
  contact: string;
  vaccinated: boolean;
  neutered: boolean;
  dewormed: boolean;
  needsHealthCare: boolean;
  physicalLimitation: boolean;
  visualLimitation: boolean;
  hearingLimitation: boolean;
  selectedPersonalities: string[];
  responsibleUserId: string;
  adoptionStatus: 'AVAILABLE';
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class PetsService {
  private readonly pets: PetRecord[] = [];

  constructor(private readonly personalityTraitsService: PersonalityTraitsService) {}

  private validateSelectedPersonalities(selectedPersonalities: string[]) {
    const validTraitIds = this.personalityTraitsService.getTraitIds();

    const invalidTraits = selectedPersonalities.filter(
      (traitId) => !validTraitIds.includes(traitId),
    );

    if (invalidTraits.length > 0) {
      throw new BadRequestException(`Invalid personality traits: ${invalidTraits.join(', ')}`);
    }
  }

  create(createPetDto: CreatePetDto) {
    if (!createPetDto.responsibleUserId) {
      throw new BadRequestException('responsibleUserId is required');
    }

    const now = new Date().toISOString();
    const selectedPersonalities = createPetDto.selectedPersonalities ?? [];

    this.validateSelectedPersonalities(selectedPersonalities);

    const pet: PetRecord = {
      id: randomUUID(),
      profilePhoto: createPetDto.profilePhoto,
      galleryPhotos: createPetDto.galleryPhotos ?? [],
      name: createPetDto.name,
      age: createPetDto.age,
      species: createPetDto.species,
      breed: createPetDto.breed,
      sex: createPetDto.sex,
      size: createPetDto.size,
      microchipped: createPetDto.microchipped,
      tutor: createPetDto.tutor,
      shelter: createPetDto.shelter,
      city: createPetDto.city,
      contact: createPetDto.contact,
      vaccinated: createPetDto.vaccinated,
      neutered: createPetDto.neutered,
      dewormed: createPetDto.dewormed,
      needsHealthCare: createPetDto.needsHealthCare,
      physicalLimitation: createPetDto.physicalLimitation,
      visualLimitation: createPetDto.visualLimitation,
      hearingLimitation: createPetDto.hearingLimitation,
      selectedPersonalities,
      responsibleUserId: createPetDto.responsibleUserId,
      adoptionStatus: 'AVAILABLE',
      createdAt: now,
      updatedAt: now,
    };

    this.pets.push(pet);

    return {
      message: 'Pet created successfully',
      data: pet,
    };
  }

  findAll(responsibleUserId?: string) {
    const pets = responsibleUserId
      ? this.pets.filter((pet) => pet.responsibleUserId === responsibleUserId)
      : this.pets;

    return {
      message: 'Pets retrieved successfully',
      data: pets,
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

    if (updatePetDto.selectedPersonalities !== undefined) {
      this.validateSelectedPersonalities(updatePetDto.selectedPersonalities);
    }

    const definedUpdates = Object.fromEntries(
      Object.entries(updatePetDto).filter(([, value]) => value !== undefined),
    ) as Partial<PetRecord>;

    const updatedPet: PetRecord = {
      ...this.pets[index],
      ...definedUpdates,
      updatedAt: new Date().toISOString(),
    };

    this.pets[index] = updatedPet;

    return {
      message: 'Pet updated successfully',
      data: updatedPet,
    };
  }
}
