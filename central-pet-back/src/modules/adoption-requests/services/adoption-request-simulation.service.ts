import { BadRequestException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { mockUsers, type MockUser } from '@/mocks';
import { PrismaService } from '@/prisma/prisma.service';
import type { SimulateAdoptionRequestDto } from '../dto/simulate-adoption-request.dto';
import { UserPersistenceService } from '../../users/user-persistence.service';
import { PetsService } from '../../pets/pets.service';
import { mapPetForResponse, mapAdopterForResponse, AdoptionRequestStatus } from '../models';
import { AuditService } from '@/modules/audit/audit.service';

@Injectable()
export class AdoptionRequestSimulationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userPersistence: UserPersistenceService,
    private readonly petsService: PetsService,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  validateSimulationPermission(userId: string, petResponsibleUserId: string): void {
    const isDev = process.env.NODE_ENV !== 'production';

    if (!isDev && petResponsibleUserId !== userId) {
      throw new BadRequestException('Só é possível simular solicitações para seus próprios pets');
    }
  }

  async findAvailableMockAdopter(ownerUserId: string, adopterId?: string): Promise<MockUser> {
    if (adopterId) {
      const mockUser = mockUsers.find((u) => u.id === adopterId);
      if (!mockUser) {
        throw new NotFoundException(`Usuário mock com id "${adopterId}" não encontrado`);
      }
      return mockUser;
    }

    const eligibleAdopters = mockUsers.filter(
      (user) => user.role === 'PESSOA_FISICA' && user.id !== ownerUserId,
    );

    if (eligibleAdopters.length === 0) {
      throw new NotFoundException('No eligible mock adopter was found');
    }

    for (const mockUser of eligibleAdopters) {
      const existingRequest = await this.prisma.adoptionRequest.findFirst({
        where: {
          adopterId: mockUser.id,
          responsibleUserId: ownerUserId,
          status: { in: [AdoptionRequestStatus.PENDING, AdoptionRequestStatus.CONTACT_SHARED] },
        },
        select: { id: true },
      });

      if (!existingRequest) {
        return mockUser;
      }
    }

    throw new BadRequestException(
      'Todos os mock adopters já possuem solicitação para este doador. Aguarde o andamento das solicitações atuais.',
    );
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

    await this.userPersistence.ensureUsersExist([dto.petResponsibleUserId, mockAdopter.id]);

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

    const mockAdopter = await this.findAvailableMockAdopter(
      dto.petResponsibleUserId,
      dto.adopterId,
    );

    await this.validateSimulationPrerequisites(dto, mockAdopter);

    const request = await this.prisma.adoptionRequest.create({
      data: {
        petId: dto.petId,
        responsibleUserId: dto.petResponsibleUserId,
        adopterId: mockAdopter.id,
        adopterContactShareConsent: dto.adopterContactShareConsent ?? false,
        responsibleContactShareConsent: dto.responsibleContactShareConsent ?? false,
        message: dto.message ?? 'Olá! Tenho interesse em adotar este pet.',
        status: dto.initialStatus ?? AdoptionRequestStatus.PENDING,
      },
    });

    // audit log: adoption request creation
    if (this.auditService) {
      await this.auditService.create({
        userId: request.adopterId,
        action: 'CREATE_ADOPTION_REQUEST',
        targetId: request.petId,
        targetType: 'PET',
        details: { requestId: request.id },
      });
    }

    const userIds = [request.adopterId];
    if (request.responsibleUserId) userIds.push(request.responsibleUserId);
    const persistedUsersById = await this.userPersistence.buildUserMap(userIds);

    const petFound = await this.petsService.findByIdForAdoption(request.petId);

    if (!petFound) {
      throw new NotFoundException(`Pet with id "${request.petId}" not found`);
    }

    const petForResponse = mapPetForResponse(petFound);

    const adopterForResponse = mapAdopterForResponse(
      request.adopterId,
      persistedUsersById,
      request.adopterContactShareConsent,
    );

    const responsibleForResponse = request.responsibleUserId
      ? mapAdopterForResponse(
          request.responsibleUserId,
          persistedUsersById,
          request.responsibleContactShareConsent,
        )
      : undefined;

    const data = {
      id: request.id,
      pet: petForResponse,
      adopter: adopterForResponse,
      responsible: responsibleForResponse,
      message: request.message,
      adopterContactShareConsent: request.adopterContactShareConsent,
      responsibleContactShareConsent: request.responsibleContactShareConsent,
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
