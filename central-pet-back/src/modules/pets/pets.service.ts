import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PersonalityTraitsService } from '../personality-traits/personality-traits.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { mockPets } from '../../mocks';

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
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class PetsService {
  // Seed in-memory store with mockPets so per-user filtering works out-of-the-box
  // Skip seeding during tests to keep test expectations deterministic
  private readonly pets: PetRecord[] =
    process.env.NODE_ENV === 'test'
      ? []
      : mockPets.map((p) => ({
          id: String(p.id),
          profilePhoto: p.photo ?? '',
          galleryPhotos: [],
          name: p.name,
          age: p.ageMonths ? `${p.ageMonths} meses` : '',
          species: this.normalizeSpecies(p.species ?? ''),
          breed: p.breed ?? '',
          sex: this.normalizeSex(p.sex ?? ''),
          size: this.normalizeSize(p.size ?? ''),
          microchipped: false,
          tutor: p.sourceName ?? '',
          shelter: p.sourceName ?? '',
          city: p.city ?? '',
          contact: '',
          vaccinated: p.vaccinated,
          neutered: p.neutered,
          dewormed: p.dewormed,
          needsHealthCare: false,
          physicalLimitation: false,
          visualLimitation: false,
          hearingLimitation: false,
          selectedPersonalities: [],
          responsibleUserId: p.responsibleUserId,
          createdAt: p.createdAt ?? new Date().toISOString(),
          updatedAt: p.updatedAt ?? new Date().toISOString(),
        }));

  constructor(private readonly personalityTraitsService: PersonalityTraitsService) {}

  private normalizeSpecies(species: string): string {
    const speciesMap: Record<string, string> = {
      dog: 'DOG',
      Dog: 'DOG',
      DOG: 'DOG',
      cachorro: 'DOG',
      Cachorro: 'DOG',
      CACHORRO: 'DOG',
      cat: 'CAT',
      Cat: 'CAT',
      CAT: 'CAT',
      gato: 'CAT',
      Gato: 'CAT',
      GATO: 'CAT',
    };
    return speciesMap[species] || species;
  }

  private normalizeSize(size: string): string {
    const sizeMap: Record<string, string> = {
      pequeno: 'SMALL',
      Pequeno: 'SMALL',
      PEQUENO: 'SMALL',
      small: 'SMALL',
      Small: 'SMALL',
      SMALL: 'SMALL',
      medio: 'MEDIUM',
      Medio: 'MEDIUM',
      MEDIO: 'MEDIUM',
      medium: 'MEDIUM',
      Medium: 'MEDIUM',
      MEDIUM: 'MEDIUM',
      grande: 'LARGE',
      Grande: 'LARGE',
      GRANDE: 'LARGE',
      large: 'LARGE',
      Large: 'LARGE',
      LARGE: 'LARGE',
    };
    return sizeMap[size] || size;
  }

  private normalizeSex(sex: string): string {
    const sexMap: Record<string, string> = {
      macho: 'MALE',
      Macho: 'MALE',
      MACHO: 'MALE',
      male: 'MALE',
      Male: 'MALE',
      MALE: 'MALE',
      femea: 'FEMALE',
      Femea: 'FEMALE',
      FEMEA: 'FEMALE',
      female: 'FEMALE',
      Female: 'FEMALE',
      FEMALE: 'FEMALE',
    };
    return sexMap[sex] || sex;
  }

  private normalizeAdoptionStatus(status: string): string {
    const statusMap: Record<string, string> = {
      available: 'AVAILABLE',
      Available: 'AVAILABLE',
      AVAILABLE: 'AVAILABLE',
      in_process: 'IN_PROCESS',
      In_process: 'IN_PROCESS',
      IN_PROCESS: 'IN_PROCESS',
      adopted: 'ADOPTED',
      Adopted: 'ADOPTED',
      ADOPTED: 'ADOPTED',
      unavailable: 'UNAVAILABLE',
      Unavailable: 'UNAVAILABLE',
      UNAVAILABLE: 'UNAVAILABLE',
    };

    const mapped = statusMap[status];
    if (!mapped) {
      throw new BadRequestException(`Invalid adoption status: ${status}`);
    }

    return mapped;
  }

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
    const now = new Date().toISOString();
    const selectedPersonalities = createPetDto.selectedPersonalities ?? [];

    this.validateSelectedPersonalities(selectedPersonalities);

    if (!createPetDto.responsibleUserId) {
      throw new BadRequestException('responsibleUserId is required');
    }

    const pet: PetRecord = {
      id: randomUUID(),
      profilePhoto: createPetDto.profilePhoto,
      galleryPhotos: createPetDto.galleryPhotos ?? [],
      name: createPetDto.name,
      age: createPetDto.age,
      species: this.normalizeSpecies(createPetDto.species),
      breed: createPetDto.breed,
      sex: this.normalizeSex(createPetDto.sex),
      size: this.normalizeSize(createPetDto.size),
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
      createdAt: now,
      updatedAt: now,
    };

    this.pets.push(pet);

    return {
      message: 'Pet created successfully',
      data: pet,
    };
  }

  private petRecordToDto(pet: PetRecord) {
    const speciesOutMap: Record<string, string> = {
      DOG: 'dog',
      CAT: 'cat',
    };

    const sexOutMap: Record<string, string> = {
      MALE: 'Macho',
      FEMALE: 'Femea',
    };

    const sizeOutMap: Record<string, string> = {
      SMALL: 'Pequeno',
      MEDIUM: 'Medio',
      LARGE: 'Grande',
    };

    return {
      ...pet,
      species: speciesOutMap[pet.species] ?? pet.species,
      sex: sexOutMap[pet.sex] ?? pet.sex,
      size: sizeOutMap[pet.size] ?? pet.size,
    };
  }

  findAll(responsibleUserId?: string) {
    const list = responsibleUserId
      ? this.pets.filter((p) => p.responsibleUserId === responsibleUserId)
      : this.pets;

    return {
      message: 'Pets retrieved successfully',
      data: list.map((p) => this.petRecordToDto(p)),
    };
  }

  findOne(id: string | number) {
    const pet = this.pets.find((item) => item.id === String(id));

    if (!pet) {
      throw new NotFoundException(`Pet with id "${id}" not found`);
    }

    return {
      message: 'Pet retrieved successfully',
      data: this.petRecordToDto(pet),
    };
  }

  update(id: string | number, updatePetDto: UpdatePetDto) {
    const index = this.pets.findIndex((item) => item.id === String(id));

    if (index === -1) {
      throw new NotFoundException(`Pet with id "${id}" not found`);
    }

    if (updatePetDto.selectedPersonalities !== undefined) {
      this.validateSelectedPersonalities(updatePetDto.selectedPersonalities);
    }

    const definedUpdates = Object.fromEntries(
      Object.entries(updatePetDto).filter(([, value]) => value !== undefined),
    ) as Partial<UpdatePetDto>;

    const normalizedUpdates: Partial<PetRecord> = {};

    if (definedUpdates.species) {
      normalizedUpdates.species = this.normalizeSpecies(definedUpdates.species);
    }
    if (definedUpdates.size) {
      normalizedUpdates.size = this.normalizeSize(definedUpdates.size);
    }
    if (definedUpdates.sex) {
      normalizedUpdates.sex = this.normalizeSex(definedUpdates.sex);
    }

    const updatedPet: PetRecord = {
      id: this.pets[index].id,
      profilePhoto: definedUpdates.profilePhoto ?? this.pets[index].profilePhoto,
      galleryPhotos: definedUpdates.galleryPhotos ?? this.pets[index].galleryPhotos,
      name: definedUpdates.name ?? this.pets[index].name,
      age: definedUpdates.age ?? this.pets[index].age,
      species: normalizedUpdates.species ?? this.pets[index].species,
      breed: definedUpdates.breed ?? this.pets[index].breed,
      sex: normalizedUpdates.sex ?? this.pets[index].sex,
      size: normalizedUpdates.size ?? this.pets[index].size,
      microchipped: definedUpdates.microchipped ?? this.pets[index].microchipped,
      tutor: definedUpdates.tutor ?? this.pets[index].tutor,
      shelter: definedUpdates.shelter ?? this.pets[index].shelter,
      city: definedUpdates.city ?? this.pets[index].city,
      contact: definedUpdates.contact ?? this.pets[index].contact,
      vaccinated: definedUpdates.vaccinated ?? this.pets[index].vaccinated,
      neutered: definedUpdates.neutered ?? this.pets[index].neutered,
      dewormed: definedUpdates.dewormed ?? this.pets[index].dewormed,
      needsHealthCare: definedUpdates.needsHealthCare ?? this.pets[index].needsHealthCare,
      physicalLimitation: definedUpdates.physicalLimitation ?? this.pets[index].physicalLimitation,
      visualLimitation: definedUpdates.visualLimitation ?? this.pets[index].visualLimitation,
      hearingLimitation: definedUpdates.hearingLimitation ?? this.pets[index].hearingLimitation,
      selectedPersonalities:
        definedUpdates.selectedPersonalities ?? this.pets[index].selectedPersonalities,
      responsibleUserId: this.pets[index].responsibleUserId,
      createdAt: this.pets[index].createdAt,
      updatedAt: new Date().toISOString(),
    };

    this.pets[index] = updatedPet;

    return {
      message: 'Pet updated successfully',
      data: updatedPet,
    };
  }
}
