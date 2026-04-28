import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PersonalityTraitsService } from '../personality-traits/personality-traits.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { UserPersistenceService } from '../users/user-persistence.service';
import { PetSeedService } from './pet-seed.service';
import { PetMapper } from './mappers/pet-record.mapper';
import type {
  PetForAdoptionRequest,
  PetRecord,
  PetResponseRecord,
} from './models/pet-record';
export type { PetForAdoptionRequest } from './models/pet-record';

type ResponsibleLocation = {
  city: string;
  state: string;
};

type ResponsiblePetMetadata = ResponsibleLocation & {
  sourceType: 'ONG' | 'PESSOA_FISICA';
  sourceName: string;
};

@Injectable()
export class PetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly personalityTraitsService: PersonalityTraitsService,
    private readonly userPersistence: UserPersistenceService,
    private readonly petSeedService: PetSeedService,
  ) {}

  private normalizeResponsibleLocation(location?: {
    city: string | null;
    state: string | null;
  }): ResponsibleLocation {
    return {
      city: location?.city ?? '',
      state: location?.state ?? '',
    };
  }

  private async buildResponsibleLocationMap(
    responsibleUserIds: Array<string | null | undefined>,
  ): Promise<Map<string, ResponsibleLocation>> {
    const validIds = [...new Set(responsibleUserIds.filter((id): id is string => Boolean(id)))];

    if (validIds.length === 0) {
      return new Map();
    }

    const users = await this.prisma.user.findMany({
      where: {
        id: { in: validIds },
        deleted: false,
      },
      select: {
        id: true,
        city: true,
        state: true,
      },
    });

    return new Map(
      users.map((user) => [user.id, this.normalizeResponsibleLocation(user)] as const),
    );
  }

  private async getResponsibleLocation(responsibleUserId: string): Promise<ResponsibleLocation> {
    return (
      (await this.buildResponsibleLocationMap([responsibleUserId])).get(responsibleUserId) ?? {
        city: '',
        state: '',
      }
    );
  }

  private async getResponsiblePetMetadata(
    responsibleUserId: string,
  ): Promise<ResponsiblePetMetadata> {
    const responsibleUser = await this.prisma.user.findUnique({
      where: { id: responsibleUserId },
      select: {
        id: true,
        role: true,
        fullName: true,
        organizationName: true,
        city: true,
        state: true,
        deleted: true,
      },
    });

    if (!responsibleUser || responsibleUser.deleted) {
      throw new NotFoundException(`Usuário com id "${responsibleUserId}" não encontrado`);
    }

    return {
      city: responsibleUser.city ?? '',
      state: responsibleUser.state ?? '',
      sourceType: responsibleUser.role,
      sourceName:
        responsibleUser.role === 'ONG'
          ? (responsibleUser.organizationName ?? responsibleUser.fullName)
          : responsibleUser.fullName,
    };
  }

  private withResponsibleLocation(
    pet: PetRecord,
    responsibleLocation: ResponsibleLocation,
  ): PetResponseRecord {
    return {
      ...pet,
      city: responsibleLocation.city,
      state: responsibleLocation.state,
    };
  }

  private validateSelectedPersonalities(selectedPersonalities: string[]) {
    const validTraitIds = this.personalityTraitsService.getTraitIds();

    const invalidTraits = selectedPersonalities.filter(
      (traitId) => !validTraitIds.includes(traitId),
    );

    if (invalidTraits.length > 0) {
      throw new BadRequestException(
        `Traits de personalidade inválidos: ${invalidTraits.join(', ')}`,
      );
    }
  }

  private async ensureMockPetsSeededIfEnabled() {
    // Garante que todos os usuários mock existam no banco
    await this.petSeedService.ensureSeed();
  }

  async create(createPetDto: CreatePetDto, responsibleUserId: string) {
    const selectedPersonalities = createPetDto.selectedPersonalities ?? [];
    this.validateSelectedPersonalities(selectedPersonalities);

    await this.userPersistence.validateUser(responsibleUserId);
    const responsibleMetadata = await this.getResponsiblePetMetadata(responsibleUserId);

    const createdPet = await this.prisma.pet.create({
      data: {
        profilePhoto: createPetDto.profilePhoto,
        galleryPhotosJson: JSON.stringify(createPetDto.galleryPhotos ?? []),
        name: createPetDto.name,
        ageText: createPetDto.age,
        species: PetMapper.mapSpeciesToPersistence(createPetDto.species),
        breed: createPetDto.breed,
        sex: PetMapper.mapSexToPersistence(createPetDto.sex),
        size: PetMapper.mapSizeToPersistence(createPetDto.size),
        microchipped: createPetDto.microchipped,
        vaccinated: createPetDto.vaccinated,
        neutered: createPetDto.neutered,
        dewormed: createPetDto.dewormed,
        needsHealthCare: createPetDto.needsHealthCare,
        physicalLimitation: createPetDto.physicalLimitation,
        visualLimitation: createPetDto.visualLimitation,
        hearingLimitation: createPetDto.hearingLimitation,
        selectedPersonalitiesJson: JSON.stringify(selectedPersonalities),
        responsibleUserId,
        sourceType: PetMapper.mapSourceTypeToPersistence(responsibleMetadata.sourceType),
        sourceName: responsibleMetadata.sourceName,
        status: 'AVAILABLE',
        deleted: false,
      },
    });

    return {
      message: 'Pet created successfully',
      data: this.withResponsibleLocation(PetMapper.toDomain(createdPet), responsibleMetadata),
    };
  }

  async findAll(responsibleUserId?: string) {
    await this.ensureMockPetsSeededIfEnabled();

    const where = responsibleUserId ? { responsibleUserId, deleted: false } : { deleted: false };

    const pets = await this.prisma.pet.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    const responsibleLocations = await this.buildResponsibleLocationMap(
      pets.map((pet) => pet.responsibleUserId),
    );

    return {
      message: 'Pets retrieved successfully',
      data: pets.map((pet) =>
        this.withResponsibleLocation(
          PetMapper.toDomain(pet),
          responsibleLocations.get(pet.responsibleUserId) ?? { city: '', state: '' },
        ),
      ),
    };
  }

  async findOne(id: string) {
    await this.ensureMockPetsSeededIfEnabled();

    const pet = await this.prisma.pet.findUnique({
      where: { id },
    });

    if (!pet || pet.deleted) {
      throw new NotFoundException(`Pet com id "${id}" não encontrado`);
    }

    return {
      message: 'Pet retrieved successfully',
      data: this.withResponsibleLocation(
        PetMapper.toDomain(pet),
        await this.getResponsibleLocation(pet.responsibleUserId),
      ),
    };
  }

  async findByIdForAdoption(id: string): Promise<PetForAdoptionRequest | null> {
    await this.ensureMockPetsSeededIfEnabled();

    const pet = await this.prisma.pet.findUnique({
      where: { id },
    });

    if (!pet || pet.deleted || !pet.responsibleUserId) {
      return null;
    }

    const responsibleLocation = await this.getResponsibleLocation(pet.responsibleUserId);
    const petRecord = PetMapper.toDomain(pet);

    return {
      id: petRecord.id,
      name: petRecord.name,
      species: petRecord.species,
      city: responsibleLocation.city,
      state: responsibleLocation.state,
      responsibleUserId: petRecord.responsibleUserId,
      sourceType: petRecord.sourceType,
      sourceName: petRecord.sourceName,
      adoptionStatus: petRecord.adoptionStatus,
    };
  }

  async finalizeAdoption(id: string, newResponsibleUserId: string) {
    const existingPet = await this.prisma.pet.findUnique({
      where: { id },
      select: {
        id: true,
        responsibleUserId: true,
        deleted: true,
      },
    });

    if (!existingPet || existingPet.deleted) {
      throw new NotFoundException(`Pet with id "${id}" not found`);
    }

    if (!existingPet.responsibleUserId) {
      throw new BadRequestException('Pet has no responsible user configured');
    }

    const updatedPet = await this.prisma.pet.update({
      where: { id },
      data: {
        responsibleUserId: newResponsibleUserId,
        status: 'ADOPTED',
      },
    });

    return {
      pet: this.withResponsibleLocation(
        PetMapper.toDomain(updatedPet),
        await this.getResponsibleLocation(updatedPet.responsibleUserId),
      ),
      previousResponsibleUserId: existingPet.responsibleUserId,
    };
  }

  async update(id: string, updatePetDto: UpdatePetDto) {
    const currentPet = await this.prisma.pet.findUnique({
      where: { id },
      select: { id: true, deleted: true },
    });

    if (!currentPet || currentPet.deleted) {
      throw new NotFoundException(`Pet with id "${id}" not found`);
    }

    if (updatePetDto.selectedPersonalities !== undefined) {
      this.validateSelectedPersonalities(updatePetDto.selectedPersonalities);
    }

    const updatedPet = await this.prisma.pet.update({
      where: { id },
      data: {
        profilePhoto: updatePetDto.profilePhoto,
        galleryPhotosJson:
          updatePetDto.galleryPhotos !== undefined
            ? JSON.stringify(updatePetDto.galleryPhotos)
            : undefined,
        name: updatePetDto.name,
        ageText: updatePetDto.age,
        species:
          updatePetDto.species !== undefined
            ? PetMapper.mapSpeciesToPersistence(updatePetDto.species)
            : undefined,
        breed: updatePetDto.breed,
        sex:
          updatePetDto.sex !== undefined ? PetMapper.mapSexToPersistence(updatePetDto.sex) : undefined,
        size:
          updatePetDto.size !== undefined
            ? PetMapper.mapSizeToPersistence(updatePetDto.size)
            : undefined,
        microchipped: updatePetDto.microchipped,
        vaccinated: updatePetDto.vaccinated,
        neutered: updatePetDto.neutered,
        dewormed: updatePetDto.dewormed,
        needsHealthCare: updatePetDto.needsHealthCare,
        physicalLimitation: updatePetDto.physicalLimitation,
        visualLimitation: updatePetDto.visualLimitation,
        hearingLimitation: updatePetDto.hearingLimitation,
        selectedPersonalitiesJson:
          updatePetDto.selectedPersonalities !== undefined
            ? JSON.stringify(updatePetDto.selectedPersonalities)
            : undefined,
      },
    });

    return {
      message: 'Pet updated successfully',
      data: this.withResponsibleLocation(
        PetMapper.toDomain(updatedPet),
        await this.getResponsibleLocation(updatedPet.responsibleUserId),
      ),
    };
  }

  async remove(id: string) {
    const currentPet = await this.prisma.pet.findUnique({
      where: { id },
      select: { id: true, deleted: true },
    });

    if (!currentPet || currentPet.deleted) {
      throw new NotFoundException(`Pet with id "${id}" not found`);
    }

    const deletedPet = await this.prisma.pet.update({
      where: { id },
      data: {
        deleted: true,
        status: 'UNAVAILABLE',
      },
    });

    return {
      message: 'Pet deleted successfully',
      data: this.withResponsibleLocation(
        PetMapper.toDomain(deletedPet),
        await this.getResponsibleLocation(deletedPet.responsibleUserId),
      ),
    };
  }
}
