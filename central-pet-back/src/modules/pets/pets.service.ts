import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { mockPets, mockUsers } from '@/mocks';
import { PrismaService } from '@/prisma/prisma.service';
import { PersonalityTraitsService } from '../personality-traits/personality-traits.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { UserPersistenceService } from '../users/user-persistence.service';

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
  vaccinated: boolean;
  neutered: boolean;
  dewormed: boolean;
  needsHealthCare: boolean;
  physicalLimitation: boolean;
  visualLimitation: boolean;
  hearingLimitation: boolean;
  selectedPersonalities: string[];
  responsibleUserId: string;
  sourceType: 'ONG' | 'PESSOA_FISICA';
  sourceName: string;
  adoptionStatus: 'AVAILABLE' | 'IN_PROCESS' | 'ADOPTED' | 'UNAVAILABLE';
  createdAt: string;
  updatedAt: string;
};

type ResponsibleLocation = {
  city: string;
  state: string;
};

export type PetResponseRecord = PetRecord & ResponsibleLocation;

export type PetForAdoptionRequest = Pick<
  PetResponseRecord,
  | 'id'
  | 'name'
  | 'species'
  | 'city'
  | 'state'
  | 'responsibleUserId'
  | 'sourceType'
  | 'sourceName'
  | 'adoptionStatus'
>;

type PersistedPetRecord = {
  id: string;
  profilePhoto: string;
  galleryPhotosJson: string | null;
  name: string;
  ageText: string;
  species: 'DOG' | 'CAT';
  breed: string;
  sex: 'FEMALE' | 'MALE';
  size: 'SMALL' | 'MEDIUM' | 'LARGE';
  microchipped: boolean;
  vaccinated: boolean;
  neutered: boolean;
  dewormed: boolean;
  needsHealthCare: boolean;
  physicalLimitation: boolean;
  visualLimitation: boolean;
  hearingLimitation: boolean;
  selectedPersonalitiesJson: string;
  responsibleUserId: string;
  sourceType: 'ONG' | 'PESSOA_FISICA';
  sourceName: string;
  status: 'AVAILABLE' | 'PENDING_ADOPTION' | 'ADOPTED' | 'UNAVAILABLE';
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class PetsService {
  private readonly isMockPetModeEnabled = process.env.ENABLE_MOCK_PETS === 'true';
  private hasSeededMockPets = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly personalityTraitsService: PersonalityTraitsService,
    private readonly userPersistence: UserPersistenceService,
  ) {}

  private normalizeSpeciesForPersistence(species: string): 'DOG' | 'CAT' {
    const normalized = species.toLowerCase();
    if (normalized === 'cat') return 'CAT';
    return 'DOG';
  }

  private normalizeSexForPersistence(sex: string): 'FEMALE' | 'MALE' {
    const normalized = sex.toLowerCase();
    if (normalized === 'female') return 'FEMALE';
    return 'MALE';
  }

  private normalizeSizeForPersistence(size: string): 'SMALL' | 'MEDIUM' | 'LARGE' {
    const normalized = size.toLowerCase();

    if (normalized === 'small') {
      return 'SMALL';
    }

    if (normalized === 'large') {
      return 'LARGE';
    }

    return 'MEDIUM';
  }

  private normalizeSpeciesForResponse(species: 'DOG' | 'CAT'): string {
    return species === 'CAT' ? 'cat' : 'dog';
  }

  private normalizeSexForResponse(sex: 'FEMALE' | 'MALE'): string {
    return sex === 'FEMALE' ? 'female' : 'male';
  }

  private normalizeSizeForResponse(size: 'SMALL' | 'MEDIUM' | 'LARGE'): string {
    if (size === 'SMALL') {
      return 'small';
    }

    if (size === 'LARGE') {
      return 'large';
    }

    return 'medium';
  }

  private normalizeAdoptionStatusForResponse(
    status: 'AVAILABLE' | 'PENDING_ADOPTION' | 'ADOPTED' | 'UNAVAILABLE',
  ): 'AVAILABLE' | 'IN_PROCESS' | 'ADOPTED' | 'UNAVAILABLE' {
    if (status === 'PENDING_ADOPTION') {
      return 'IN_PROCESS';
    }

    return status;
  }

  private parseJsonArray(value: string | null): string[] {
    if (!value) {
      return [];
    }

    try {
      const parsed = JSON.parse(value) as unknown;

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter((item): item is string => typeof item === 'string');
    } catch {
      return [];
    }
  }

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

  private toRecord(pet: PersistedPetRecord): PetRecord {
    return {
      id: pet.id,
      profilePhoto: pet.profilePhoto,
      galleryPhotos: this.parseJsonArray(pet.galleryPhotosJson),
      name: pet.name,
      age: pet.ageText,
      species: this.normalizeSpeciesForResponse(pet.species),
      breed: pet.breed,
      sex: this.normalizeSexForResponse(pet.sex),
      size: this.normalizeSizeForResponse(pet.size),
      microchipped: pet.microchipped,
      vaccinated: pet.vaccinated,
      neutered: pet.neutered,
      dewormed: pet.dewormed,
      needsHealthCare: pet.needsHealthCare,
      physicalLimitation: pet.physicalLimitation,
      visualLimitation: pet.visualLimitation,
      hearingLimitation: pet.hearingLimitation,
      selectedPersonalities: this.parseJsonArray(pet.selectedPersonalitiesJson),
      responsibleUserId: pet.responsibleUserId,
      sourceType: pet.sourceType,
      sourceName: pet.sourceName,
      adoptionStatus: this.normalizeAdoptionStatusForResponse(pet.status),
      createdAt: pet.createdAt.toISOString(),
      updatedAt: pet.updatedAt.toISOString(),
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
        `Traits de personalidade invalidos: ${invalidTraits.join(', ')}`,
      );
    }
  }

  private async ensureMockPetsSeededIfEnabled() {
    if (!this.isMockPetModeEnabled || this.hasSeededMockPets) {
      return;
    }

    // Garante que todos os usuários mock existam no banco
    const mockUserIds = mockUsers.map((u) => u.id);
    await this.userPersistence.ensureUsersExist(mockUserIds);

    for (const pet of mockPets) {
      await this.prisma.pet.upsert({
        where: { id: String(pet.id) },
        update: {},
        create: {
          id: String(pet.id),
          name: pet.name,
          ageText: pet.ageMonths ? `${pet.ageMonths} meses` : 'Idade nao informada',
          species: this.normalizeSpeciesForPersistence(pet.species),
          breed: pet.breed ?? 'SRD',
          sex: this.normalizeSexForPersistence(pet.sex ?? 'male'),
          size: this.normalizeSizeForPersistence(pet.size ?? 'medium'),
          profilePhoto: pet.photo ?? '',
          galleryPhotosJson: '[]',
          microchipped: false,
          vaccinated: pet.vaccinated,
          neutered: pet.neutered,
          dewormed: pet.dewormed,
          needsHealthCare: false,
          physicalLimitation: false,
          visualLimitation: false,
          hearingLimitation: false,
          selectedPersonalitiesJson: '[]',
          responsibleUserId: pet.responsibleUserId,
          sourceType: pet.sourceType,
          sourceName: pet.sourceName,
          status: 'AVAILABLE',
          deleted: false,
        },
      });
    }

    this.hasSeededMockPets = true;
  }

  async create(createPetDto: CreatePetDto) {
    if (!createPetDto.responsibleUserId) {
      throw new BadRequestException('O campo responsibleUserId e obrigatorio');
    }

    const selectedPersonalities = createPetDto.selectedPersonalities ?? [];
    this.validateSelectedPersonalities(selectedPersonalities);

    await this.userPersistence.validateUser(createPetDto.responsibleUserId);

    const createdPet = await this.prisma.pet.create({
      data: {
        profilePhoto: createPetDto.profilePhoto,
        galleryPhotosJson: JSON.stringify(createPetDto.galleryPhotos ?? []),
        name: createPetDto.name,
        ageText: createPetDto.age,
        species: this.normalizeSpeciesForPersistence(createPetDto.species),
        breed: createPetDto.breed,
        sex: this.normalizeSexForPersistence(createPetDto.sex),
        size: this.normalizeSizeForPersistence(createPetDto.size),
        microchipped: createPetDto.microchipped,
        vaccinated: createPetDto.vaccinated,
        neutered: createPetDto.neutered,
        dewormed: createPetDto.dewormed,
        needsHealthCare: createPetDto.needsHealthCare,
        physicalLimitation: createPetDto.physicalLimitation,
        visualLimitation: createPetDto.visualLimitation,
        hearingLimitation: createPetDto.hearingLimitation,
        selectedPersonalitiesJson: JSON.stringify(selectedPersonalities),
        responsibleUserId: createPetDto.responsibleUserId,
        sourceType: createPetDto.sourceType,
        sourceName: createPetDto.sourceName,
        status: 'AVAILABLE',
        deleted: false,
      },
    });

    return {
      message: 'Pet created successfully',
      data: this.withResponsibleLocation(
        this.toRecord(createdPet),
        await this.getResponsibleLocation(createdPet.responsibleUserId),
      ),
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
          this.toRecord(pet),
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
      throw new NotFoundException(`Pet com id "${id}" nao encontrado`);
    }

    return {
      message: 'Pet retrieved successfully',
      data: this.withResponsibleLocation(
        this.toRecord(pet),
        await this.getResponsibleLocation(pet.responsibleUserId),
      ),
    };
  }

  async findByIdForAdoption(id: string): Promise<PetForAdoptionRequest | null> {
    await this.ensureMockPetsSeededIfEnabled();

    const pet = await this.prisma.pet.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        species: true,
        responsibleUserId: true,
        sourceType: true,
        sourceName: true,
        status: true,
        deleted: true,
      },
    });

    if (!pet || pet.deleted || !pet.responsibleUserId) {
      return null;
    }

    const responsibleLocation = await this.getResponsibleLocation(pet.responsibleUserId);

    return {
      id: pet.id,
      name: pet.name,
      species: this.normalizeSpeciesForResponse(pet.species),
      city: responsibleLocation.city,
      state: responsibleLocation.state,
      responsibleUserId: pet.responsibleUserId,
      sourceType: pet.sourceType,
      sourceName: pet.sourceName,
      adoptionStatus: this.normalizeAdoptionStatusForResponse(pet.status),
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
        this.toRecord(updatedPet),
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
            ? this.normalizeSpeciesForPersistence(updatePetDto.species)
            : undefined,
        breed: updatePetDto.breed,
        sex:
          updatePetDto.sex !== undefined
            ? this.normalizeSexForPersistence(updatePetDto.sex)
            : undefined,
        size:
          updatePetDto.size !== undefined
            ? this.normalizeSizeForPersistence(updatePetDto.size)
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
        this.toRecord(updatedPet),
        await this.getResponsibleLocation(updatedPet.responsibleUserId),
      ),
    };
  }

  async remove(id: string, requesterId: string) {
    const currentPet = await this.prisma.pet.findUnique({
      where: { id },
      select: { id: true, deleted: true, responsibleUserId: true },
    });

    if (!currentPet || currentPet.deleted) {
      throw new NotFoundException(`Pet with id "${id}" not found`);
    }

    if (currentPet.responsibleUserId !== requesterId) {
      throw new ForbiddenException('You are not the owner of this pet');
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
        this.toRecord(deletedPet),
        await this.getResponsibleLocation(deletedPet.responsibleUserId),
      ),
    };
  }
}
