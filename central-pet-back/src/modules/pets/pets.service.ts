import { BadRequestException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { PersonalityTraitsService } from '../personality-traits/personality-traits.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { UserPersistenceService } from '../users/user-persistence.service';
import { PetMapper } from './mappers/pet-record.mapper';
import { PetSeedService } from './pet-seed.service';
import { PetRecord } from './models/pet-record';
import { Pet, PetStatus } from '@prisma/client';

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

@Injectable()
export class PetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly personalityTraitsService: PersonalityTraitsService,
    private readonly userPersistence: UserPersistenceService,
    private readonly seedService: PetSeedService,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  private validateSelectedPersonalities(selectedPersonalities: string[]) {
    const validTraitIds = this.personalityTraitsService.getTraitIds();
    const invalidTraits = selectedPersonalities.filter((id) => !validTraitIds.includes(id));

    if (invalidTraits.length > 0) {
      throw new BadRequestException(`Traits inválidos: ${invalidTraits.join(', ')}`);
    }
  }

  async create(dto: CreatePetDto, responsibleUserId: string) {
    const personalities = dto.selectedPersonalities ?? [];
    this.validateSelectedPersonalities(personalities);
    await this.userPersistence.validateUser(responsibleUserId);

    const pet = await this.prisma.pet.create({
      data: {
        profilePhoto: dto.profilePhoto,
        name: dto.name,
        ageText: dto.age,
        species: PetMapper.mapSpeciesToPersistence(dto.species),
        breed: dto.breed,
        sex: PetMapper.mapSexToPersistence(dto.sex),
        size: PetMapper.mapSizeToPersistence(dto.size),
        microchipped: dto.microchipped,
        tutor: dto.tutor,
        shelter: dto.shelter,
        city: dto.city,
        state: dto.state,
        contact: dto.contact,
        vaccinated: dto.vaccinated,
        neutered: dto.neutered,
        dewormed: dto.dewormed,
        needsHealthCare: dto.needsHealthCare,
        physicalLimitation: dto.physicalLimitation,
        visualLimitation: dto.visualLimitation,
        hearingLimitation: dto.hearingLimitation,
        sourceType: PetMapper.mapSourceTypeToPersistence(dto.sourceType),
        sourceName: dto.sourceName,
        galleryPhotosJson: JSON.stringify(dto.galleryPhotos ?? []),
        selectedPersonalitiesJson: JSON.stringify(personalities),
        responsibleUserId,
        status: PetStatus.AVAILABLE,
        deleted: false,
      },
    });

    if (this.auditService) {
      await this.auditService.create({
        userId: responsibleUserId,
        action: 'CREATE_PET',
        targetId: pet.id,
        targetType: 'PET',
        details: { name: dto.name },
      });
    }

    return { message: 'Pet created successfully', data: PetMapper.toDomain(pet) };
  }

  async findAll(responsibleUserId?: string) {
    await this.seedService.ensureSeed();
    const where = { deleted: false, ...(responsibleUserId && { responsibleUserId }) };
    const pets = await this.prisma.pet.findMany({ where, orderBy: { createdAt: 'desc' } });

    return {
      message: 'Pets retrieved successfully',
      data: pets.map((p) => PetMapper.toDomain(p)),
    };
  }

  async findOne(id: string) {
    await this.seedService.ensureSeed();
    const pet = await this.prisma.pet.findUnique({ where: { id } });
    if (!pet || pet.deleted) throw new NotFoundException(`Pet "${id}" não encontrado`);

    return { message: 'Pet retrieved successfully', data: PetMapper.toDomain(pet) };
  }

  async findByIdForAdoption(id: string): Promise<PetForAdoptionRequest | null> {
    await this.seedService.ensureSeed();
    const pet = await this.prisma.pet.findUnique({ where: { id } });
    if (!pet || pet.deleted || !pet.responsibleUserId) return null;

    const domain = PetMapper.toDomain(pet);
    return {
      id: domain.id,
      name: domain.name,
      species: domain.species,
      city: domain.city,
      state: domain.state ?? '',
      responsibleUserId: domain.responsibleUserId,
      sourceType: domain.sourceType,
      sourceName: domain.sourceName,
      adoptionStatus: domain.adoptionStatus,
    };
  }

  async finalizeAdoption(id: string, newResponsibleUserId: string) {
    const existing = await this.prisma.pet.findUnique({ where: { id } });
    if (!existing || existing.deleted) throw new NotFoundException(`Pet "${id}" not found`);
    if (!existing.responsibleUserId) throw new BadRequestException('Pet has no responsible user');

    const updated = await this.prisma.pet.update({
      where: { id },
      data: { responsibleUserId: newResponsibleUserId, status: PetStatus.ADOPTED },
    });

    return {
      pet: PetMapper.toDomain(updated),
      previousResponsibleUserId: existing.responsibleUserId,
    };
  }

  async update(id: string, dto: UpdatePetDto) {
    if (dto.selectedPersonalities) this.validateSelectedPersonalities(dto.selectedPersonalities);

    const updated = await this.prisma.pet.update({
      where: { id },
      data: {
        profilePhoto: dto.profilePhoto,
        name: dto.name,
        ageText: dto.age,
        breed: dto.breed,
        microchipped: dto.microchipped,
        tutor: dto.tutor,
        shelter: dto.shelter,
        city: dto.city,
        state: dto.state,
        contact: dto.contact,
        vaccinated: dto.vaccinated,
        neutered: dto.neutered,
        dewormed: dto.dewormed,
        needsHealthCare: dto.needsHealthCare,
        physicalLimitation: dto.physicalLimitation,
        visualLimitation: dto.visualLimitation,
        hearingLimitation: dto.hearingLimitation,
        sourceName: dto.sourceName,
        ...(dto.sourceType && { sourceType: PetMapper.mapSourceTypeToPersistence(dto.sourceType) }),
        ...(dto.species && { species: PetMapper.mapSpeciesToPersistence(dto.species) }),
        ...(dto.sex && { sex: PetMapper.mapSexToPersistence(dto.sex) }),
        ...(dto.size && { size: PetMapper.mapSizeToPersistence(dto.size) }),
        ...(dto.galleryPhotos && { galleryPhotosJson: JSON.stringify(dto.galleryPhotos) }),
        ...(dto.selectedPersonalities && {
          selectedPersonalitiesJson: JSON.stringify(dto.selectedPersonalities),
        }),
      },
    });

    return { message: 'Pet updated successfully', data: PetMapper.toDomain(updated) };
  }

  async remove(id: string) {
    const pet = await this.prisma.pet.update({
      where: { id },
      data: { deleted: true, status: PetStatus.UNAVAILABLE },
    });
    return { message: 'Pet deleted successfully', data: PetMapper.toDomain(pet) };
  }
}
