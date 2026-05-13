import { BadRequestException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { PersonalityTraitsService } from '../personality-traits/personality-traits.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { UserPersistenceService } from '../users/user-persistence.service';
import { PetSeedService } from './pet-seed.service';
import { PetMapper } from './mappers/pet-record.mapper';
import type { PetForAdoptionRequest, PetRecord, PetResponseRecord } from './models/pet-record';
import { Prisma } from '@/../generated/prisma/client';
export type { PetForAdoptionRequest } from './models/pet-record';

const generatePetPublicIdSuffix = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);

type ResponsibleLocation = {
  city: string;
  state: string;
};

const CANCEL_REASON_ADMIN_BLOCK =
  'Solicitação cancelada automaticamente devido ao bloqueio administrativo do pet.';

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
    @Optional() private readonly auditService?: AuditService,
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

    if (
      responsibleUser.role &&
      responsibleUser.role !== 'ONG' &&
      responsibleUser.role !== 'PESSOA_FISICA'
    ) {
      throw new BadRequestException(
        'Apenas ONGs e pessoas físicas podem ser responsáveis por pets.',
      );
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

  private async validateSelectedPersonalities(selectedPersonalities: string[]) {
    const traits = await this.personalityTraitsService.getAllTraits();
    const traitMap = new Map(traits.map((trait) => [trait.id, trait]));

    const invalidTraits = selectedPersonalities.filter((traitId) => !traitMap.has(traitId));

    if (invalidTraits.length > 0) {
      throw new BadRequestException(
        `Traits de personalidade inválidos: ${invalidTraits.join(', ')}`,
      );
    }

    const selectedSet = new Set(selectedPersonalities);
    const conflictingTraits = selectedPersonalities.flatMap((traitId) => {
      const trait = traitMap.get(traitId);
      if (!trait) return [];

      return trait.conflictsWith
        .filter((conflictId) => selectedSet.has(conflictId))
        .map((conflictId) => `${traitId}/${conflictId}`);
    });

    if (conflictingTraits.length > 0) {
      throw new BadRequestException(
        `Traits de personalidade conflitantes: ${[...new Set(conflictingTraits)].join(', ')}`,
      );
    }
  }

  private async ensureMockPetsSeededIfEnabled() {
    // Garante que todos os usuários mock existam no banco
    await this.petSeedService.ensureSeed();
  }

  private generatePetPublicId(): string {
    return `pet_${generatePetPublicIdSuffix()}`;
  }

  private async resolveInternalIdWithPetClient(
    petClient: Pick<PrismaService, 'pet'>['pet'] | Prisma.TransactionClient['pet'],
    identifier: string,
  ): Promise<string | null> {
    const byId = await petClient.findUnique({
      where: { id: identifier },
      select: { id: true },
    });

    if (byId) {
      return byId.id;
    }

    const byPublicId = await petClient.findUnique({
      where: { publicId: identifier },
      select: { id: true },
    });

    return byPublicId?.id ?? null;
  }

  async resolveInternalId(identifier: string): Promise<string | null> {
    return this.resolveInternalIdWithPetClient(this.prisma.pet, identifier);
  }

  private async findPetByIdentifier(identifier: string) {
    const internalId = await this.resolveInternalId(identifier);
    if (!internalId) {
      return null;
    }

    return this.prisma.pet.findUnique({
      where: { id: internalId },
    });
  }

  async create(createPetDto: CreatePetDto, responsibleUserId: string) {
    const selectedPersonalities = createPetDto.selectedPersonalities ?? [];
    await this.validateSelectedPersonalities(selectedPersonalities);

    await this.userPersistence.validateUser(responsibleUserId);
    const responsibleMetadata = await this.getResponsiblePetMetadata(responsibleUserId);

    let createdPet: Awaited<ReturnType<PrismaService['pet']['create']>> | null = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const publicId = this.generatePetPublicId();
      try {
        createdPet = await this.prisma.pet.create({
          data: {
            publicId,
            profilePhoto: createPetDto.profilePhoto,
            galleryPhotosJson: createPetDto.galleryPhotos ?? [],
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
            selectedPersonalitiesJson: selectedPersonalities,
            responsibleUserId,
            sourceType: PetMapper.mapSourceTypeToPersistence(responsibleMetadata.sourceType),
            sourceName: responsibleMetadata.sourceName,
            status: 'AVAILABLE',
            deleted: false,
          },
        });
        break;
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002' &&
          Array.isArray(error.meta?.target) &&
          error.meta.target.includes('publicId')
        ) {
          continue;
        }
        throw error;
      }
    }

    if (!createdPet) {
      throw new BadRequestException('Falha ao gerar identificador público único para o pet.');
    }

    if (this.auditService) {
      await this.auditService.create({
        userId: responsibleUserId,
        action: 'CREATE_PET',
        targetId: createdPet.id,
        targetType: 'PET',
        details: { name: createPetDto.name },
      });
    }

    return {
      message: 'Pet created successfully',
      data: this.withResponsibleLocation(PetMapper.toDomain(createdPet), responsibleMetadata),
    };
  }

  async findAll(filters?: {
    responsibleUserId?: string;
    adoptionStatus?: 'AVAILABLE' | 'ADOPTED' | 'UNAVAILABLE';
    state?: string;
    species?: 'DOG' | 'CAT';
    sex?: 'MALE' | 'FEMALE';
    size?: 'SMALL' | 'MEDIUM' | 'LARGE';
  }) {
    await this.ensureMockPetsSeededIfEnabled();

    const where = {
      deleted: false,
      ...(filters?.responsibleUserId ? { responsibleUserId: filters.responsibleUserId } : {}),
      ...(filters?.adoptionStatus ? { status: filters.adoptionStatus } : {}),
      ...(filters?.species ? { species: filters.species } : {}),
      ...(filters?.sex ? { sex: filters.sex } : {}),
      ...(filters?.size ? { size: filters.size } : {}),
      ...(filters?.state ? { responsibleUser: { state: filters.state } } : {}),
    };

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

    const pet = await this.findPetByIdentifier(id);

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

  async findByIdForAdoption(
    id: string,
    opts?: { includeDeleted?: boolean },
  ): Promise<PetForAdoptionRequest | null> {
    await this.ensureMockPetsSeededIfEnabled();

    const includeDeleted = opts?.includeDeleted ?? false;

    const pet = await this.findPetByIdentifier(id);

    if (!pet || (!includeDeleted && pet.deleted) || !pet.responsibleUserId) {
      return null;
    }

    const responsibleLocation = await this.getResponsibleLocation(pet.responsibleUserId);
    const petRecord = PetMapper.toDomain(pet);
    return {
      internalId: pet.id,
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
    const internalId = await this.resolveInternalId(id);

    const existingPet = internalId
      ? await this.prisma.pet.findUnique({
          where: { id: internalId },
          select: {
            id: true,
            responsibleUserId: true,
            deleted: true,
          },
        })
      : null;

    if (!existingPet || existingPet.deleted) {
      throw new NotFoundException(`Pet with id "${id}" not found`);
    }

    if (!existingPet.responsibleUserId) {
      throw new BadRequestException('Pet has no responsible user configured');
    }

    const updatedPet = await this.prisma.pet.update({
      where: { id: existingPet.id },
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
    const internalId = await this.resolveInternalId(id);
    const currentPet = internalId
      ? await this.prisma.pet.findUnique({
          where: { id: internalId },
          select: { id: true, deleted: true },
        })
      : null;

    if (!currentPet || currentPet.deleted) {
      throw new NotFoundException(`Pet with id "${id}" not found`);
    }

    if (updatePetDto.selectedPersonalities !== undefined) {
      await this.validateSelectedPersonalities(updatePetDto.selectedPersonalities);
    }

    const updatedPet = await this.prisma.pet.update({
      where: { id: currentPet.id },
      data: {
        profilePhoto: updatePetDto.profilePhoto,
        galleryPhotosJson: updatePetDto.galleryPhotos,
        name: updatePetDto.name,
        ageText: updatePetDto.age,
        species:
          updatePetDto.species !== undefined
            ? PetMapper.mapSpeciesToPersistence(updatePetDto.species)
            : undefined,
        breed: updatePetDto.breed,
        sex:
          updatePetDto.sex !== undefined
            ? PetMapper.mapSexToPersistence(updatePetDto.sex)
            : undefined,
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
        selectedPersonalitiesJson: updatePetDto.selectedPersonalities,
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

  async reactivatePetTransactional(
    tx: Prisma.TransactionClient,
    id: string,
    performedBy: string,
    details?: Record<string, unknown>,
  ) {
    const internalId = await this.resolveInternalIdWithPetClient(tx.pet, id);
    const currentPet = await tx.pet.findUnique({
      where: { id: internalId ?? id },
      select: { id: true, deleted: true, status: true, responsibleUserId: true },
    });

    if (!currentPet || !currentPet.deleted) {
      // Keep behavior similar to public remove: treat as not found
      throw new NotFoundException(`Pet com id "${id}" não encontrado ou já está ativo`);
    }

    await tx.pet.update({
      where: { id: currentPet.id },
      data: { deleted: false, status: 'AVAILABLE' },
    });

    // Restaurar solicitações canceladas automaticamente pela moderação
    if (tx.adoptionRequest) {
      await tx.adoptionRequest.updateMany({
        where: {
          petId: currentPet.id,
          status: 'CANCELLED',
          note: CANCEL_REASON_ADMIN_BLOCK,
        },
        data: {
          status: 'PENDING',
          note: null,
          version: { increment: 1 },
        },
      });
    }

    if (this.auditService) {
      await this.auditService.createWithTx(tx, {
        userId: performedBy,
        action: 'REACTIVATE_PET',
        targetId: currentPet.id,
        targetType: 'PET',
        details: { ...details },
      });
    }
  }

  async removeTransactional(
    tx: Prisma.TransactionClient,
    id: string,
    performedBy?: string,
    details?: Record<string, unknown>,
  ) {
    const internalId = await this.resolveInternalIdWithPetClient(tx.pet, id);
    const currentPet = await tx.pet.findUnique({
      where: { id: internalId ?? id },
      select: { id: true, deleted: true, status: true, responsibleUserId: true },
    });

    if (!currentPet || currentPet.deleted) {
      // Keep behavior similar to public remove: treat as not found
      throw new NotFoundException(`Pet with id "${id}" not found`);
    }

    const deletedPet = await tx.pet.update({
      where: { id: currentPet.id },
      data: {
        deleted: true,
        status: 'UNAVAILABLE',
      },
    });

    // Cancelar solicitações pendentes do pet
    if (tx.adoptionRequest) {
      await tx.adoptionRequest.updateMany({
        where: {
          petId: currentPet.id,
          status: { in: ['PENDING', 'CONTACT_SHARED'] },
        },
        data: {
          status: 'CANCELLED',
          note: CANCEL_REASON_ADMIN_BLOCK,
          version: { increment: 1 },
        },
      });
    }

    if (this.auditService && performedBy) {
      await this.auditService.createWithTx(tx, {
        userId: performedBy,
        action: 'DEACTIVATE_PET',
        targetId: deletedPet.id,
        targetType: 'PET',
        details: {
          ...details,
          previousStatus: currentPet.status,
          newStatus: 'UNAVAILABLE',
        },
      });
    }

    return deletedPet;
  }

  async remove(id: string, performedBy?: string) {
    const deletedPet = await this.prisma.$transaction(async (tx) => {
      return this.removeTransactional(tx, id, performedBy);
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
