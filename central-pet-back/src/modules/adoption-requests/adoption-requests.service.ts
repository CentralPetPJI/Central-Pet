import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { mockAdoptionRequests, type MockAdoptionRequest } from '@/mocks';
import { randomUUID } from 'crypto';
import {
  mapToReceivedAdoptionRequest,
  type ReceivedAdoptionRequest,
} from './models/received-adoption-request';
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

@Injectable()
export class AdoptionRequestsService {
  private readonly adoptionRequests: MockAdoptionRequest[] = [...mockAdoptionRequests];
  private readonly notifications: AdoptionRequestNotification[] = [];

  findReceived(responsibleUserId?: string): { message: string; data: ReceivedAdoptionRequest[] } {
    const data = this.adoptionRequests
      .map((request) => {
        // Snapshots são obrigatórios - requests sem snapshot são inválidos
        if (!request.petSnapshot || !request.adopterSnapshot) {
          return null;
        }

        // Aqui sabemos que os snapshots existem
        const petSnapshot = request.petSnapshot;
        const adopterSnapshot = request.adopterSnapshot;

        return mapToReceivedAdoptionRequest({
          request,
          pet: petSnapshot,
          adopter: adopterSnapshot,
        });
      })
      .filter((request): request is ReceivedAdoptionRequest => request !== null)
      .filter((request) =>
        responsibleUserId ? request.pet.responsibleUserId === responsibleUserId : true,
      )
      .sort(
        (left, right) =>
          new Date(right.requestedAt).getTime() - new Date(left.requestedAt).getTime(),
      );

    return {
      message: 'Received adoption requests retrieved successfully',
      data,
    };
  }

  simulateReceived(userId: string, dto: SimulateAdoptionRequestDto): AdoptionRequestActionResult {
    // Em desenvolvimento, permite simulação mesmo que o userId não corresponda
    // Isso é útil quando testamos com pets de diferentes usuários
    const isDev = process.env.NODE_ENV !== 'production';

    if (!isDev && dto.petResponsibleUserId !== userId) {
      throw new BadRequestException('You can only simulate requests for your own pets');
    }

    // Adotante simulado para desenvolvimento
    const simulatedAdopterId = randomUUID();
    const adopterSnapshot = {
      id: simulatedAdopterId,
      name: 'João Silva (Adotante Simulado)',
      city: dto.petCity || 'São Paulo',
      state: dto.petState || 'SP',
    };

    const now = new Date().toISOString();
    const request: MockAdoptionRequest = {
      id: randomUUID(),
      petId: dto.petId,
      petSnapshot: {
        id: dto.petId,
        name: dto.petName,
        species: dto.petSpecies,
        city: dto.petCity ?? 'Cidade não informada',
        state: dto.petState ?? 'UF',
        responsibleUserId: dto.petResponsibleUserId,
        sourceType: dto.petSourceType,
        sourceName: dto.petSourceName,
      },
      adopterId: simulatedAdopterId,
      adopterSnapshot,
      message:
        dto.message ??
        `Olá! Tenho interesse em adotar ${dto.petName}. Gostaria de conhecer melhor o pet.`,
      status: 'PENDING',
      requestedAt: now,
      updatedAt: now,
    };

    this.adoptionRequests.unshift(request);

    return {
      message: 'Adoption request simulated successfully',
      data: mapToReceivedAdoptionRequest({
        request,
        pet: request.petSnapshot!,
        adopter: adopterSnapshot,
      }),
    };
  }

  manageReceived(
    requestId: string,
    userId: string,
    dto: ManageAdoptionRequestDto,
  ): AdoptionRequestActionResult {
    const index = this.adoptionRequests.findIndex((request) => request.id === requestId);

    if (index === -1) {
      throw new NotFoundException(`Adoption request with id "${requestId}" not found`);
    }

    const currentRequest = this.adoptionRequests[index];

    // Snapshots são obrigatórios
    if (!currentRequest.petSnapshot || !currentRequest.adopterSnapshot) {
      throw new NotFoundException(`Adoption request with id "${requestId}" has invalid data`);
    }

    const pet = currentRequest.petSnapshot;
    const adopter = currentRequest.adopterSnapshot;

    if (pet.responsibleUserId !== userId) {
      throw new BadRequestException('You cannot manage requests for pets you do not own');
    }

    const canBeManaged =
      currentRequest.status === 'PENDING' || currentRequest.status === 'UNDER_REVIEW';

    if (!canBeManaged) {
      throw new BadRequestException('This adoption request has already been managed');
    }

    if (!manageAdoptionRequestActions.includes(dto.action)) {
      throw new BadRequestException('Invalid adoption request action');
    }

    const isRejectAction = dto.action === 'reject';
    const nextStatus: MockAdoptionRequest['status'] = isRejectAction
      ? 'rejected'
      : 'contact_shared';

    if (isRejectAction && dto.rejectionReason?.trim()) {
      this.adoptionRequests[index] = {
        ...currentRequest,
        status: nextStatus,
        rejectionReason: dto.rejectionReason.trim(),
        updatedAt: new Date().toISOString(),
      };
    } else {
      const { rejectionReason: _ignored, ...rest } = currentRequest;
      this.adoptionRequests[index] = {
        ...rest,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      };
    }

    const updatedRequest = this.adoptionRequests[index];
    const notification =
      nextStatus === 'contact_shared'
        ? {
            id: `${requestId}-notification-contact-shared`,
            requestId,
            recipientId: adopter.id,
            type: 'contact_shared' as const,
            message: `O tutor compartilhou o contato referente ao pet ${pet.name}.`,
            createdAt: updatedRequest.updatedAt,
          }
        : {
            id: `${requestId}-notification-rejected`,
            requestId,
            recipientId: adopter.id,
            type: 'rejected' as const,
            message: `Sua solicitacao para ${pet.name} foi recusada.`,
            createdAt: updatedRequest.updatedAt,
          };

    this.notifications.push(notification);

    return {
      message: isRejectAction
        ? 'Solicitação de adoção recusada com sucesso'
        : 'Contato compartilhado com sucesso',
      data: mapToReceivedAdoptionRequest({ request: updatedRequest, pet, adopter }),
      notification,
    };
  }
}
