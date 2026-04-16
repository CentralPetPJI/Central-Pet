import { Injectable, NotFoundException } from '@nestjs/common';
import { mockUsers, type MockUser } from '@/mocks';
import { PrismaService } from '@/prisma/prisma.service';
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
import { MockUserPersistenceService } from '../mock-auth';

@Injectable()
export class AdoptionRequestsService {
  private readonly mockUsersById = new Map<string, MockUser>(
    mockUsers.map((u) => [u.id, u] as const),
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly simulationService: AdoptionRequestSimulationService,
    private readonly manageService: ManageAdoptionRequestsService,
    private readonly petsService: PetsService,
    private readonly userPersistence: MockUserPersistenceService,
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
    await this.userPersistence.ensurePersistedUsersExist(adopterIds, this.mockUsersById);
    const persistedUsersById = await this.userPersistence.buildPersistedUserMap(
      adopterIds,
      this.mockUsersById,
    );

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
      const adopterForResponse = mapAdopterForResponse(
        r.adopterId,
        this.mockUsersById,
        persistedUsersById,
      );

      return {
        id: r.id,
        pet: petForResponse,
        adopter: adopterForResponse,
        message: r.message,
        adopterContactShareConsent: r.adopterContactShareConsent,
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

    // ensure persisted users exist and build persisted map
    await this.userPersistence.ensurePersistedUsersExist(
      [updatedReq.adopterId],
      this.mockUsersById,
    );
    const persistedUsersById = await this.userPersistence.buildPersistedUserMap(
      [updatedReq.adopterId],
      this.mockUsersById,
    );

    const petFound = await this.petsService.findByIdForAdoption(updatedReq.petId);
    if (!petFound) {
      throw new NotFoundException(`Pet com id "${updatedReq.petId}" não encontrado`);
    }

    const petForResponse = mapPetForResponse(petFound);
    const adopterForResponse = mapAdopterForResponse(
      updatedReq.adopterId,
      this.mockUsersById,
      persistedUsersById,
    );

    const data = {
      id: updatedReq.id,
      pet: petForResponse,
      adopter: adopterForResponse,
      message: updatedReq.message,
      adopterContactShareConsent: updatedReq.adopterContactShareConsent,
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
}
