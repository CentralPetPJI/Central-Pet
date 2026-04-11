import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { mockPets, mockUsers, type MockUser } from '@/mocks';
import { PrismaService } from '@/prisma/prisma.service';
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
  state?: string;
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
  sourceType?: 'ONG' | 'PESSOA_FISICA';
  sourceName?: string;
  adoptionStatus: 'AVAILABLE' | 'IN_PROCESS' | 'ADOPTED' | 'UNAVAILABLE';
  createdAt: string;
  updatedAt: string;
};

export type PetForAdoptionRequest = Pick<
  PetRecord,
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

const MOCK_PASSWORD_HASH = 'mock-password-hash';

@Injectable()
export class PetsService {
  private readonly isMockPetModeEnabled = process.env.ENABLE_MOCK_PETS === 'true';
  private hasSeededMockPets = false;
  private readonly mockUsersById = new Map<string, MockUser>(
    mockUsers.map((user) => [user.id, user] as const),
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly personalityTraitsService: PersonalityTraitsService,
  ) {}

  private normalizeSpeciesForPersistence(species: string): 'DOG' | 'CAT' {
    return species.toLowerCase().includes('cat') || species.toLowerCase().includes('gato')
      ? 'CAT'
      : 'DOG';
  }

  private normalizeSexForPersistence(sex: string): 'FEMALE' | 'MALE' {
    return sex.toLowerCase().includes('f') ? 'FEMALE' : 'MALE';
  }

  private normalizeSizeForPersistence(size: string): 'SMALL' | 'MEDIUM' | 'LARGE' {
    const normalized = size.toLowerCase();

    if (normalized.includes('peq')) {
      return 'SMALL';
    }

    if (normalized.includes('gran')) {
      return 'LARGE';
    }

    return 'MEDIUM';
  }

  private normalizeSpeciesForResponse(species: 'DOG' | 'CAT'): string {
    return species === 'CAT' ? 'cat' : 'dog';
  }

  private normalizeSexForResponse(sex: 'FEMALE' | 'MALE'): string {
    return sex === 'FEMALE' ? 'Femea' : 'Macho';
  }

  private normalizeSizeForResponse(size: 'SMALL' | 'MEDIUM' | 'LARGE'): string {
    if (size === 'SMALL') {
      return 'Pequeno';
    }

    if (size === 'LARGE') {
      return 'Grande';
    }

    return 'Medio';
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

  private toRecord(pet: {
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
    tutor: string;
    shelter: string;
    city: string;
    state: string | null;
    contact: string;
    vaccinated: boolean;
    neutered: boolean;
    dewormed: boolean;
    needsHealthCare: boolean;
    physicalLimitation: boolean;
    visualLimitation: boolean;
    hearingLimitation: boolean;
    selectedPersonalitiesJson: string;
    responsibleUserId: string | null;
    sourceType: 'ONG' | 'PESSOA_FISICA' | null;
    sourceName: string | null;
    status: 'AVAILABLE' | 'PENDING_ADOPTION' | 'ADOPTED' | 'UNAVAILABLE';
    createdAt: Date;
    updatedAt: Date;
  }): PetRecord {
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
      tutor: pet.tutor,
      shelter: pet.shelter,
      city: pet.city,
      state: pet.state ?? undefined,
      contact: pet.contact,
      vaccinated: pet.vaccinated,
      neutered: pet.neutered,
      dewormed: pet.dewormed,
      needsHealthCare: pet.needsHealthCare,
      physicalLimitation: pet.physicalLimitation,
      visualLimitation: pet.visualLimitation,
      hearingLimitation: pet.hearingLimitation,
      selectedPersonalities: this.parseJsonArray(pet.selectedPersonalitiesJson),
      responsibleUserId: pet.responsibleUserId ?? '',
      sourceType: pet.sourceType ?? undefined,
      sourceName: pet.sourceName ?? undefined,
      adoptionStatus: this.normalizeAdoptionStatusForResponse(pet.status),
      createdAt: pet.createdAt.toISOString(),
      updatedAt: pet.updatedAt.toISOString(),
    };
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

  private async upsertMockUser(mockUser: MockUser) {
    await this.prisma.user.upsert({
      where: { id: mockUser.id },
      update: {
        fullName: mockUser.fullName,
        email: mockUser.email,
        role: mockUser.role,
        birthDate: mockUser.birthDate ?? null,
        organizationName: mockUser.organizationName ?? null,
      },
      create: {
        id: mockUser.id,
        fullName: mockUser.fullName,
        email: mockUser.email,
        role: mockUser.role,
        birthDate: mockUser.birthDate ?? null,
        cpf: null,
        organizationName: mockUser.organizationName ?? null,
        cnpj: null,
        passwordHash: MOCK_PASSWORD_HASH,
      },
    });
  }

  private async ensureResponsibleUserExists(responsibleUserId: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: responsibleUserId },
      select: { id: true },
    });

    if (existingUser) {
      return;
    }

    const mockUser = this.mockUsersById.get(responsibleUserId);

    if (!mockUser) {
      throw new BadRequestException(
        'responsibleUserId inválido: usuário não encontrado para vincular o pet.',
      );
    }

    await this.upsertMockUser(mockUser);
  }

  private async ensureMockPetsSeededIfEnabled() {
    if (!this.isMockPetModeEnabled || this.hasSeededMockPets) {
      return;
    }

    for (const user of mockUsers) {
      await this.upsertMockUser(user);
    }

    for (const pet of mockPets) {
      await this.prisma.pet.upsert({
        where: { id: String(pet.id) },
        update: {},
        create: {
          id: String(pet.id),
          name: pet.name,
          ageText: pet.ageMonths ? `${pet.ageMonths} meses` : 'Idade não informada',
          species: this.normalizeSpeciesForPersistence(pet.species),
          breed: pet.breed ?? 'SRD',
          sex: this.normalizeSexForPersistence(pet.sex ?? 'Macho'),
          size: this.normalizeSizeForPersistence(pet.size ?? 'Medio'),
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
          tutor: pet.sourceName ?? 'Tutor não informado',
          shelter: pet.sourceName ?? 'Origem não informada',
          city: pet.city ?? 'Cidade não informada',
          state: pet.state ?? null,
          contact: 'Contato não informado',
          selectedPersonalitiesJson: '[]',
          responsibleUserId: pet.responsibleUserId,
          sourceType: pet.sourceType ?? null,
          sourceName: pet.sourceName ?? null,
          status: 'AVAILABLE',
          deleted: false,
        },
      });
    }

    this.hasSeededMockPets = true;
  }

  async create(createPetDto: CreatePetDto) {
    if (!createPetDto.responsibleUserId) {
      throw new BadRequestException('responsibleUserId is required');
    }

    const selectedPersonalities = createPetDto.selectedPersonalities ?? [];
    this.validateSelectedPersonalities(selectedPersonalities);
    await this.ensureResponsibleUserExists(createPetDto.responsibleUserId);

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
        tutor: createPetDto.tutor,
        shelter: createPetDto.shelter,
        city: createPetDto.city,
        state: createPetDto.state ?? null,
        contact: createPetDto.contact,
        vaccinated: createPetDto.vaccinated,
        neutered: createPetDto.neutered,
        dewormed: createPetDto.dewormed,
        needsHealthCare: createPetDto.needsHealthCare,
        physicalLimitation: createPetDto.physicalLimitation,
        visualLimitation: createPetDto.visualLimitation,
        hearingLimitation: createPetDto.hearingLimitation,
        selectedPersonalitiesJson: JSON.stringify(selectedPersonalities),
        responsibleUserId: createPetDto.responsibleUserId,
        sourceType: null,
        sourceName: null,
        status: 'AVAILABLE',
        deleted: false,
      },
    });

    return {
      message: 'Pet created successfully',
      data: this.toRecord(createdPet),
    };
  }

  async findAll(responsibleUserId?: string) {
    await this.ensureMockPetsSeededIfEnabled();

    const where = responsibleUserId ? { responsibleUserId, deleted: false } : { deleted: false };

    const pets = await this.prisma.pet.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Pets retrieved successfully',
      data: pets.map((pet) => this.toRecord(pet)),
    };
  }

  async findOne(id: string) {
    await this.ensureMockPetsSeededIfEnabled();

    const pet = await this.prisma.pet.findUnique({
      where: { id },
    });

    if (!pet || pet.deleted) {
      throw new NotFoundException(`Pet with id "${id}" not found`);
    }

    return {
      message: 'Pet retrieved successfully',
      data: this.toRecord(pet),
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
        city: true,
        state: true,
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

    return {
      id: pet.id,
      name: pet.name,
      species: this.normalizeSpeciesForResponse(pet.species),
      city: pet.city,
      state: pet.state ?? undefined,
      responsibleUserId: pet.responsibleUserId,
      sourceType: pet.sourceType ?? 'ONG',
      sourceName: pet.sourceName ?? 'Origem não informada',
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
      pet: this.toRecord(updatedPet),
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
        tutor: updatePetDto.tutor,
        shelter: updatePetDto.shelter,
        city: updatePetDto.city,
        state: updatePetDto.state,
        contact: updatePetDto.contact,
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
      data: this.toRecord(updatedPet),
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
      data: this.toRecord(deletedPet),
    };
  }
}
