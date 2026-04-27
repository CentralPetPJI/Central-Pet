import { Injectable } from '@nestjs/common';
import { mockPets, mockUsers } from '@/mocks';
import { PrismaService } from '@/prisma/prisma.service';
import { UserPersistenceService } from '../users/user-persistence.service';
import { PetMapper } from './mappers/pet-record.mapper';
import { PetStatus } from '../../../generated/prisma/client';

@Injectable()
export class PetSeedService {
  private hasSeeded = false;
  private readonly isEnabled = process.env.ENABLE_MOCK_PETS === 'true';

  constructor(
    private readonly prisma: PrismaService,
    private readonly userPersistence: UserPersistenceService,
  ) {}

  async ensureSeed() {
    if (!this.isEnabled || this.hasSeeded) return;

    const mockUserIds = mockUsers.map((u) => u.id);
    await this.userPersistence.ensureUsersExist(mockUserIds);

    for (const pet of mockPets) {
      await this.prisma.pet.upsert({
        where: { id: String(pet.id) },
        update: {},
        create: {
          id: String(pet.id),
          name: pet.name,
          ageText: pet.ageMonths ? `${pet.ageMonths} meses` : 'Idade não informada',
          species: PetMapper.mapSpeciesToPersistence(pet.species),
          breed: pet.breed ?? 'SRD',
          sex: PetMapper.mapSexToPersistence(pet.sex ?? 'male'),
          size: PetMapper.mapSizeToPersistence(pet.size ?? 'medium'),
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
          state: pet.state,
          contact: 'Contato não informado',
          selectedPersonalitiesJson: '[]',
          responsibleUserId: pet.responsibleUserId,
          sourceType: PetMapper.mapSourceTypeToPersistence(pet.sourceType),
          sourceName: pet.sourceName,
          status: PetStatus.AVAILABLE,
          deleted: false,
        },
      });
    }

    this.hasSeeded = true;
  }
}
