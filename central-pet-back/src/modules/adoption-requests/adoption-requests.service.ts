import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type {
  ReceivedAdoptionRequest,
  AdoptionRequestActionResult,
  AdoptionRequestRecord,
} from './models';
import { AdoptionRequestStatus, mapPetForResponse, mapAdopterForResponse } from './models';
import { type ManageAdoptionRequestDto } from './dto/manage-adoption-request.dto';
import type { SimulateAdoptionRequestDto } from './dto/simulate-adoption-request.dto';
import { AdoptionRequestSimulationService, ManageAdoptionRequestsService } from './services';
import { PetsService, type PetForAdoptionRequest } from '../pets/pets.service';
import { UserPersistenceService } from '../users/user-persistence.service';
import { CreateAdoptionRequestDto } from '@/modules/adoption-requests/dto/create-adoption-request.dto';
import { PetStatus } from '../../../generated/prisma/enums';

@Injectable()
export class AdoptionRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly simulationService: AdoptionRequestSimulationService,
    private readonly manageService: ManageAdoptionRequestsService,
    private readonly petsService: PetsService,
    private readonly userPersistence: UserPersistenceService,
  ) {}

  /**
   * Função auxiliar para resolver adotantes, pets e mapear solicitações de adoção para o formato de resposta da API.
   * @param requests Array de registros de solicitações de adoção vindos do banco
   * @returns Array de ReceivedAdoptionRequest para resposta da API
   */
  private async mapRequestsToResponse(
    requests: AdoptionRequestRecord[],
  ): Promise<ReceivedAdoptionRequest[]> {
    const adopterIds = Array.from(new Set(requests.map((r) => r.adopterId)));
    await this.userPersistence.ensureUsersExist(adopterIds);
    const persistedUsersById = await this.userPersistence.buildUserMap(adopterIds);

    const petsById = new Map<string, PetForAdoptionRequest | null>();
    await Promise.all(
      requests.map(async (r) => {
        const pet = await this.petsService.findByIdForAdoption(r.petId);
        petsById.set(r.petId, pet ?? null);
      }),
    );

    return requests.map((r) => {
      const petFound = petsById.get(r.petId);
      if (!petFound) {
        // Solicitação deve sempre referenciar um pet existente; falha rápida para expor problemas de integridade de dados.
        throw new NotFoundException(`Pet com id "${r.petId}" não encontrado`);
      }

      const petForResponse = mapPetForResponse(petFound);
      const adopterForResponse = mapAdopterForResponse(r.adopterId, persistedUsersById);

      return {
        id: r.id,
        pet: petForResponse,
        adopter: adopterForResponse,
        message: r.message,
        adopterContactShareConsent: r.adopterContactShareConsent,
        responsibleContactShareConsent: r.responsibleContactShareConsent,
        status: r.status as unknown as AdoptionRequestStatus,
        note: r.note ?? undefined,
        requestedAt: r.requestedAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      } as ReceivedAdoptionRequest;
    });
  }

  async findReceived(
    responsibleUserId?: string,
  ): Promise<{ message: string; data: ReceivedAdoptionRequest[] }> {
    const requests: AdoptionRequestRecord[] = await this.prisma.adoptionRequest.findMany({
      where: responsibleUserId ? { responsibleUserId } : undefined,
      orderBy: { requestedAt: 'desc' },
    });

    const mapped = await this.mapRequestsToResponse(requests);

    return {
      message: 'Solicitações de adoção recebidas recuperadas com sucesso',
      data: mapped,
    };
  }

  async findSent(
    adopterId?: string,
  ): Promise<{ message: string; data: ReceivedAdoptionRequest[] }> {
    const requests: AdoptionRequestRecord[] = await this.prisma.adoptionRequest.findMany({
      where: adopterId ? { adopterId } : undefined,
      orderBy: { requestedAt: 'desc' },
    });

    const mapped = await this.mapRequestsToResponse(requests);

    return {
      message: 'Solicitações de adoção enviadas recuperadas com sucesso',
      data: mapped,
    };
  }

  async simulateReceived(
    userId: string,
    dto: SimulateAdoptionRequestDto,
  ): Promise<AdoptionRequestActionResult> {
    const res = await this.simulationService.simulateReceived(userId, dto);
    // normalize status enum type (Prisma generated enum vs internal enum type)
    if (res?.data && res.data.status) {
      return {
        ...res,
        data: {
          ...res.data,
          status: res.data.status as unknown as AdoptionRequestStatus,
        },
      } as AdoptionRequestActionResult;
    }

    return res as AdoptionRequestActionResult;
  }

  async manageReceived(
    requestId: string,
    userId: string,
    dto: ManageAdoptionRequestDto,
  ): Promise<AdoptionRequestActionResult> {
    const result = await this.manageService.manageReceived(requestId, userId, dto);

    const updatedReq = result.updatedReq;

    if (!updatedReq) {
      throw new NotFoundException(
        `Updated request not returned from manager for id "${requestId}"`,
      );
    }

    await this.userPersistence.ensureUsersExist([updatedReq.adopterId]);
    const persistedUsersById = await this.userPersistence.buildUserMap([updatedReq.adopterId]);

    const petFound = await this.petsService.findByIdForAdoption(updatedReq.petId);
    if (!petFound) {
      throw new NotFoundException(`Pet com id "${updatedReq.petId}" não encontrado`);
    }

    const petForResponse = mapPetForResponse(petFound);
    const adopterForResponse = mapAdopterForResponse(updatedReq.adopterId, persistedUsersById);

    const data = {
      id: updatedReq.id,
      pet: petForResponse,
      adopter: adopterForResponse,
      message: updatedReq.message,
      adopterContactShareConsent: updatedReq.adopterContactShareConsent,
      responsibleContactShareConsent: updatedReq.responsibleContactShareConsent,
      status: updatedReq.status as unknown as AdoptionRequestStatus,
      note: updatedReq.note ?? undefined,
      requestedAt: updatedReq.requestedAt.toISOString(),
      updatedAt: updatedReq.updatedAt.toISOString(),
    } as ReceivedAdoptionRequest;

    return {
      message: result.message,
      data,
      notification: result.notification,
    };
  }

  async create(
    adopterId: string,
    dto: CreateAdoptionRequestDto,
  ): Promise<{ message: string; data: ReceivedAdoptionRequest }> {
    const { petId, message } = dto;

    //1. Buscar pet
    const pet = await this.petsService.findByIdForAdoption(petId);

    if (!pet) {
      throw new NotFoundException(`Pet com id "${petId}" não encontrado`);
    }

    if (pet.adoptionStatus !== 'AVAILABLE') {
      throw new BadRequestException('Pet não está disponível para adoção');
    }

    // 2. Não pode adotar o próprio pet
    if (pet.responsibleUserId === adopterId) {
      throw new BadRequestException('Você não pode adotar seu próprio pet');
    }

    // 3. Validar se já existe solicitação pendente
    const existingRequest = await this.prisma.adoptionRequest.findFirst({
      where: {
        petId,
        adopterId,
        status: {
          in: ['PENDING', 'APPROVED'],
        },
      },
    });

    if (existingRequest) {
      throw new BadRequestException('Você já possui uma solicitação ativa para este pet');
    }

    // 4. Criar no banco
    let created;
    try {
      created = await this.prisma.adoptionRequest.create({
        data: {
          petId,
          adopterId,
          responsibleUserId: pet.responsibleUserId,
          message: message ?? '',
          status: 'PENDING',
          adopterContactShareConsent: false,
          responsibleContactShareConsent: false,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Você já possui uma solicitação pendente para este pet');
      }
      throw error;
    }

    const [mapped] = await this.mapRequestsToResponse([created]);

    return {
      message: 'Solicitação enviada com sucesso',
      data: mapped,
    };
  }
}
