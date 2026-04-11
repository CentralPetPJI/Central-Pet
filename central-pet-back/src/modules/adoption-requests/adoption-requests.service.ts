import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { mockUsers, type MockUser } from '@/mocks';
import { PrismaService } from '@/prisma/prisma.service';
import { PetHistoryService } from '../pet-history/pet-history.service';
import { PetsService } from '../pets/pets.service';
import {
  mapToReceivedAdoptionRequest,
  type ReceivedAdoptionRequest,
  type ReceivedAdoptionRequestAdopter,
  type ReceivedAdoptionRequestPet,
} from './models/received-adoption-request';
import {
  canApproveForStatus,
  canRejectForStatus,
  canShareContactForStatus,
  type AdoptionRequestStatus,
} from './models/adoption-request-status';
import type { AdoptionRequestRecord } from './models/adoption-request-record';
import {
  manageAdoptionRequestActions,
  type ManageAdoptionRequestDto,
} from './dto/manage-adoption-request.dto';
import type { SimulateAdoptionRequestDto } from './dto/simulate-adoption-request.dto';

type AdoptionRequestNotification = {
  id: string;
  requestId: string;
  recipientId: string;
  type: 'contact_shared' | 'rejected';
  message: string;
  createdAt: string;
};

type AdoptionRequestActionResult = {
  message: string;
  data: ReceivedAdoptionRequest;
  notification?: AdoptionRequestNotification;
};

const MOCK_PASSWORD_HASH = 'mock-password-hash';

@Injectable()
export class AdoptionRequestsService {
  private readonly notifications: AdoptionRequestNotification[] = [];
  private readonly mockUsersById = new Map<string, MockUser>(
    mockUsers.map((user) => [user.id, user] as const),
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly petsService: PetsService,
    private readonly petHistoryService: PetHistoryService,
  ) {}

  private toRecord(request: {
    id: string;
    petId: string;
    responsibleUserId: string;
    adopterId: string;
    adopterContactShareConsent: boolean;
    message: string;
    status: AdoptionRequestStatus;
    note: string | null;
    requestedAt: Date;
    updatedAt: Date;
  }): AdoptionRequestRecord {
    return {
      id: request.id,
      petId: request.petId,
      responsibleUserId: request.responsibleUserId,
      adopterId: request.adopterId,
      adopterContactShareConsent: request.adopterContactShareConsent,
      message: request.message,
      status: request.status,
      note: request.note,
      requestedAt: request.requestedAt,
      updatedAt: request.updatedAt,
    };
  }

  private getSimulationAdopter(ownerUserId: string, adopterId?: string): MockUser {
    if (adopterId) {
      const mockUser = this.mockUsersById.get(adopterId);

      if (!mockUser) {
        throw new NotFoundException(`Mock user with id "${adopterId}" not found`);
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

  private async ensureSingleRequestPerDonor(adopterId: string, responsibleUserId: string) {
    const existingRequest = await this.prisma.adoptionRequest.findFirst({
      where: {
        adopterId,
        responsibleUserId,
        status: {
          in: ['pending', 'contact_shared'],
        },
      },
      select: {
        id: true,
      },
    });

    if (existingRequest) {
      throw new BadRequestException(
        'Você já possui uma solicitação para este doador. Aguarde o andamento da solicitação atual.',
      );
    }
  }

  private async ensurePersistedUserExists(userId: string) {
    const mockUser = this.mockUsersById.get(userId);

    if (!mockUser) {
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!existingUser) {
        throw new NotFoundException(`User with id "${userId}" not found`);
      }

      return;
    }

    await this.prisma.user.upsert({
      where: { id: mockUser.id },
      update: {
        fullName: mockUser.fullName,
        email: mockUser.email,
        role: mockUser.role,
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

  private async ensurePersistedUsersForSimulation(responsibleUserId: string, adopterId: string) {
    await this.ensurePersistedUserExists(responsibleUserId);
    await this.ensurePersistedUserExists(adopterId);
  }

  private async ensurePetCanReceiveRequests(petId: string, responsibleUserId: string) {
    const pet = await this.petsService.findByIdForAdoption(petId);

    if (!pet) {
      throw new NotFoundException(`Pet with id "${petId}" not found`);
    }

    if (pet.responsibleUserId !== responsibleUserId) {
      throw new BadRequestException('The provided responsible user does not match the pet owner');
    }

    if (pet.adoptionStatus === 'ADOPTED') {
      throw new BadRequestException(
        'Este pet já foi adotado e não pode receber novas solicitações de adoção.',
      );
    }

    return pet;
  }

  private async resolvePetForResponse(
    petId: string,
    responsibleUserId: string,
  ): Promise<ReceivedAdoptionRequestPet> {
    const pet = await this.petsService.findByIdForAdoption(petId);

    if (pet) {
      return {
        id: pet.id,
        name: pet.name,
        species: pet.species,
        city: pet.city,
        state: pet.state ?? 'UF',
        responsibleUserId: pet.responsibleUserId,
        sourceType: pet.sourceType ?? 'ONG',
        sourceName: pet.sourceName ?? 'Origem não informada',
      };
    }

    return {
      id: petId,
      name: 'Pet não encontrado',
      species: 'UNKNOWN',
      city: 'Cidade não informada',
      state: 'UF',
      responsibleUserId,
      sourceType: 'ONG',
      sourceName: 'Origem não informada',
    };
  }

  private async buildPersistedUserMap(adopterIds: string[]) {
    const missingIds = adopterIds.filter((adopterId) => !this.mockUsersById.has(adopterId));

    if (missingIds.length === 0) {
      return new Map<string, { id: string; fullName: string }>();
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: [...new Set(missingIds)] } },
      select: { id: true, fullName: true },
    });

    return new Map(users.map((user) => [user.id, user] as const));
  }

  private resolveAdopterForResponse(
    adopterId: string,
    persistedUsersById: Map<string, { id: string; fullName: string }>,
  ): ReceivedAdoptionRequestAdopter {
    const mockUser = this.mockUsersById.get(adopterId);

    if (mockUser) {
      return {
        id: mockUser.id,
        name: mockUser.fullName,
        city: mockUser.city ?? 'Cidade não informada',
        state: mockUser.state ?? 'UF',
      };
    }

    const persistedUser = persistedUsersById.get(adopterId);

    if (persistedUser) {
      return {
        id: persistedUser.id,
        name: persistedUser.fullName,
        city: 'Cidade não informada',
        state: 'UF',
      };
    }

    return {
      id: adopterId,
      name: 'Usuário não encontrado',
      city: 'Cidade não informada',
      state: 'UF',
    };
  }

  async findReceived(responsibleUserId?: string): Promise<{
    message: string;
    data: ReceivedAdoptionRequest[];
  }> {
    const requests = await this.prisma.adoptionRequest.findMany({
      where: responsibleUserId ? { responsibleUserId } : undefined,
      orderBy: { requestedAt: 'desc' },
    });

    const persistedUsersById = await this.buildPersistedUserMap(
      requests.map((request) => request.adopterId),
    );

    const data = await Promise.all(
      requests.map(async (request) =>
        mapToReceivedAdoptionRequest({
          request: this.toRecord(request),
          pet: await this.resolvePetForResponse(request.petId, request.responsibleUserId),
          adopter: this.resolveAdopterForResponse(request.adopterId, persistedUsersById),
        }),
      ),
    );

    return {
      message: 'Received adoption requests retrieved successfully',
      data,
    };
  }

  async simulateReceived(
    userId: string,
    dto: SimulateAdoptionRequestDto,
  ): Promise<AdoptionRequestActionResult> {
    const isDev = process.env.NODE_ENV !== 'production';

    if (!isDev && dto.petResponsibleUserId !== userId) {
      throw new BadRequestException('You can only simulate requests for your own pets');
    }

    await this.ensurePetCanReceiveRequests(dto.petId, dto.petResponsibleUserId);
    const mockAdopter = this.getSimulationAdopter(dto.petResponsibleUserId, dto.adopterId);
    await this.ensurePersistedUsersForSimulation(dto.petResponsibleUserId, mockAdopter.id);
    await this.ensureSingleRequestPerDonor(mockAdopter.id, dto.petResponsibleUserId);

    const request = await this.prisma.adoptionRequest.create({
      data: {
        petId: dto.petId,
        responsibleUserId: dto.petResponsibleUserId,
        adopterId: mockAdopter.id,
        adopterContactShareConsent: dto.adopterContactShareConsent ?? false,
        message: dto.message ?? 'Olá! Tenho interesse em adotar este pet.',
        status: dto.initialStatus ?? 'pending',
      },
    });

    return {
      message: 'Adoption request simulated successfully',
      data: mapToReceivedAdoptionRequest({
        request: this.toRecord(request),
        pet: await this.resolvePetForResponse(request.petId, request.responsibleUserId),
        adopter: {
          id: mockAdopter.id,
          name: mockAdopter.fullName,
          city: mockAdopter.city ?? 'Cidade não informada',
          state: mockAdopter.state ?? 'UF',
        },
      }),
    };
  }

  async manageReceived(
    requestId: string,
    userId: string,
    dto: ManageAdoptionRequestDto,
  ): Promise<AdoptionRequestActionResult> {
    const currentRequest = await this.prisma.adoptionRequest.findUnique({
      where: { id: requestId },
    });

    if (!currentRequest) {
      throw new NotFoundException(`Adoption request with id "${requestId}" not found`);
    }

    if (currentRequest.responsibleUserId !== userId) {
      throw new BadRequestException('You cannot manage requests for pets you do not own');
    }

    if (!manageAdoptionRequestActions.includes(dto.action)) {
      throw new BadRequestException('Invalid adoption request action');
    }

    if (dto.action === 'approve') {
      if (!canApproveForStatus(currentRequest.status)) {
        throw new BadRequestException('Only requests with shared contact can be approved');
      }

      await this.ensurePetCanReceiveRequests(
        currentRequest.petId,
        currentRequest.responsibleUserId,
      );
      // TODO: Wrap entire approval flow in a transaction for atomicity in production
      // For now, execute in sequence but they should all succeed or all fail together
      const updatedRequest = await this.prisma.adoptionRequest.update({
        where: { id: requestId },
        data: {
          status: 'approved',
          note: dto.note?.trim() || null,
        },
      });

      const autoRejectionNote =
        'Solicitação encerrada automaticamente porque este pet já foi adotado.';

      const { count: autoRejectedCount } = await this.prisma.adoptionRequest.updateMany({
        where: {
          petId: updatedRequest.petId,
          id: { not: updatedRequest.id },
          status: 'pending',
        },
        data: {
          status: 'rejected',
          note: autoRejectionNote,
        },
      });

      // Update pet ownership and status
      const updatedPet = await this.prisma.pet.update({
        where: { id: updatedRequest.petId },
        data: {
          responsibleUserId: updatedRequest.adopterId,
          status: 'ADOPTED',
        },
      });

      // Record pet history for adoption approval
      await this.petHistoryService.create(
        {
          petId: updatedRequest.petId,
          eventType: 'ADOPTION_APPROVED',
          description: 'Adoção concluída e responsabilidade transferida para o adotante.',
          fromResponsible: currentRequest.responsibleUserId,
          toResponsible: updatedRequest.adopterId,
        },
        userId,
      );

      const result = {
        updatedRequest,
        updatedPet,
        autoRejectedCount,
        previousResponsibleUserId: currentRequest.responsibleUserId,
      };

      const persistedUsersById = await this.buildPersistedUserMap([
        result.updatedRequest.adopterId,
      ]);

      return {
        message:
          result.autoRejectedCount > 0
            ? `Solicitação de adoção aprovada com sucesso. ${result.autoRejectedCount} solicitação(ões) pendente(s) foram recusadas automaticamente porque o pet já foi adotado.`
            : 'Solicitação de adoção aprovada com sucesso',
        data: mapToReceivedAdoptionRequest({
          request: this.toRecord(result.updatedRequest),
          pet: await this.resolvePetForResponse(
            result.updatedRequest.petId,
            result.updatedRequest.responsibleUserId,
          ),
          adopter: this.resolveAdopterForResponse(
            result.updatedRequest.adopterId,
            persistedUsersById,
          ),
        }),
      };
    }

    const isRejectAction = dto.action === 'reject';

    if (isRejectAction && !canRejectForStatus(currentRequest.status)) {
      throw new BadRequestException(
        'This adoption request cannot be rejected in the current status',
      );
    }

    if (!isRejectAction && !canShareContactForStatus(currentRequest.status)) {
      throw new BadRequestException('You can only share contact for pending requests');
    }

    if (!isRejectAction && !currentRequest.adopterContactShareConsent) {
      throw new BadRequestException(
        'The adopter must authorize contact sharing before this step can be completed',
      );
    }

    const nextStatus: AdoptionRequestStatus = isRejectAction ? 'rejected' : 'contact_shared';
    const updatedRequest = await this.prisma.adoptionRequest.update({
      where: { id: requestId },
      data: {
        status: nextStatus,
        note: dto.note?.trim() || null,
      },
    });

    // Record PetHistory for both share_contact and reject actions
    const eventType = isRejectAction ? 'ADOPTION_REJECTED' : 'ADOPTION_CONTACT_SHARED';
    const description = isRejectAction
      ? 'Solicitação de adoção recusada.'
      : 'Contato do tutor compartilhado com o adotante.';

    await this.petHistoryService.create(
      {
        petId: updatedRequest.petId,
        eventType,
        description,
        fromResponsible: currentRequest.responsibleUserId,
        toResponsible: null,
      },
      userId,
    );

    const notification =
      nextStatus === 'contact_shared'
        ? {
            id: `${requestId}-notification-contact-shared`,
            requestId,
            recipientId: updatedRequest.adopterId,
            type: 'contact_shared' as const,
            message: `O tutor compartilhou o contato referente ao pet ${updatedRequest.petId}.`,
            createdAt: updatedRequest.updatedAt.toISOString(),
          }
        : {
            id: `${requestId}-notification-rejected`,
            requestId,
            recipientId: updatedRequest.adopterId,
            type: 'rejected' as const,
            message: `Sua solicitação para o pet ${updatedRequest.petId} foi recusada.`,
            createdAt: updatedRequest.updatedAt.toISOString(),
          };

    this.notifications.push(notification);

    const persistedUsersById = await this.buildPersistedUserMap([updatedRequest.adopterId]);

    return {
      message: isRejectAction
        ? 'Solicitação de adoção recusada com sucesso'
        : 'Contato compartilhado com sucesso',
      data: mapToReceivedAdoptionRequest({
        request: this.toRecord(updatedRequest),
        pet: await this.resolvePetForResponse(
          updatedRequest.petId,
          updatedRequest.responsibleUserId,
        ),
        adopter: this.resolveAdopterForResponse(updatedRequest.adopterId, persistedUsersById),
      }),
      notification,
    };
  }
}
