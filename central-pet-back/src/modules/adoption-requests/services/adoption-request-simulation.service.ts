import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { mockUsers, type MockUser } from '@/mocks';
import { PrismaService } from '@/prisma/prisma.service';
import type { SimulateAdoptionRequestDto } from '../dto/simulate-adoption-request.dto';
import { MockUserPersistenceService } from '../../mock-auth';
import { PetsService } from '../../pets/pets.service';
import { mapPetForResponse, mapAdopterForResponse, AdoptionRequestStatus } from '../models';

@Injectable()
export class AdoptionRequestSimulationService {
  private readonly mockUsersById = new Map<string, MockUser>(
    mockUsers.map((user) => [user.id, user] as const),
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly userPersistence: MockUserPersistenceService,
    private readonly petsService: PetsService,
  ) {}

  validateSimulationPermission(userId: string, petResponsibleUserId: string): void {
    const isDev = process.env.NODE_ENV !== 'production';

    if (!isDev && petResponsibleUserId !== userId) {
      throw new BadRequestException('Só é possível simular solicitações para seus próprios pets');
    }
  }

  getSimulationAdopter(ownerUserId: string, adopterId?: string): MockUser {
    if (adopterId) {
      const mockUser = this.mockUsersById.get(adopterId);

      if (!mockUser) {
        throw new NotFoundException(`Usuário mock com id "${adopterId}" não encontrado`);
      }

      if (mockUser.role !== 'PESSOA_FISICA') {
        throw new BadRequestException('Only mock users with role PESSOA_FISICA can adopt pets');
      }

      if (mockUser.id === ownerUserId) {
        throw new BadRequestException('The adopter cannot be the pet owner');
      }

      return mockUser;
    }

    const eligibleAdopters = mockUsers.filter(
      (user) => user.role === 'PESSOA_FISICA' && user.id !== ownerUserId,
    );

    if (eligibleAdopters.length === 0) {
      throw new NotFoundException('No eligible mock adopter was found');
    }

    const randomIndex = Math.floor(Math.random() * eligibleAdopters.length);
    const randomAdopter = eligibleAdopters[randomIndex];

    if (!randomAdopter) {
      throw new NotFoundException('No eligible mock adopter was found');
    }

    return randomAdopter;
  }

  async validateSimulationPrerequisites(
    dto: SimulateAdoptionRequestDto,
    mockAdopter: MockUser,
  ): Promise<void> {
    const pet = await this.petsService.findByIdForAdoption(dto.petId);

    if (!pet) {
      throw new NotFoundException(`Pet with id "${dto.petId}" not found`);
    }

    if (pet.adoptionStatus === 'ADOPTED') {
      throw new BadRequestException(
        'Este pet já foi adotado e não pode receber novas solicitações de adoção.',
      );
    }

    await this.userPersistence.ensurePersistedUsersExist(
      [dto.petResponsibleUserId, mockAdopter.id],
      this.mockUsersById,
    );

    const existingRequest = await this.prisma.adoptionRequest.findFirst({
      where: {
        adopterId: mockAdopter.id,
        responsibleUserId: dto.petResponsibleUserId,
        status: { in: [AdoptionRequestStatus.PENDING, AdoptionRequestStatus.CONTACT_SHARED] },
      },
      select: { id: true },
    });

    if (existingRequest) {
      throw new BadRequestException(
        'Você já possui uma solicitação para este doador. Aguarde o andamento da solicitação atual.',
      );
    }
  }

  async simulateReceived(userId: string, dto: SimulateAdoptionRequestDto) {
    this.validateSimulationPermission(userId, dto.petResponsibleUserId);

    const mockAdopter = this.getSimulationAdopter(dto.petResponsibleUserId, dto.adopterId);

    await this.validateSimulationPrerequisites(dto, mockAdopter);

    const request = await this.prisma.adoptionRequest.create({
      data: {
        petId: dto.petId,
        responsibleUserId: dto.petResponsibleUserId,
        adopterId: mockAdopter.id,
        adopterContactShareConsent: dto.adopterContactShareConsent ?? false,
        message: dto.message ?? 'Olá! Tenho interesse em adotar este pet.',
        status: dto.initialStatus ?? AdoptionRequestStatus.PENDING,
      },
    });

    const persistedUsersById = await this.userPersistence.buildPersistedUserMap(
      [request.adopterId],
      this.mockUsersById,
    );

    const petFound = await this.petsService.findByIdForAdoption(request.petId);

    if (!petFound) {
      throw new NotFoundException(`Pet with id "${request.petId}" not found`);
    }

    const petForResponse = mapPetForResponse(petFound);

    const adopterForResponse = mapAdopterForResponse(
      request.adopterId,
      this.mockUsersById,
      persistedUsersById,
    );

    const data = {
      id: request.id,
      pet: petForResponse,
      adopter: adopterForResponse,
      message: request.message,
      adopterContactShareConsent: request.adopterContactShareConsent,
      status: request.status,
      note: request.note ?? undefined,
      requestedAt: request.requestedAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    };

    return {
      message: 'Adoption request simulated successfully',
      data,
    };
  }
}
