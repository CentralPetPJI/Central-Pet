import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { mockUserIds } from '@/mocks';
import { PrismaService } from '@/prisma/prisma.service';
import { PetHistoryService } from '../pet-history/pet-history.service';
import { PetsService, type PetForAdoptionRequest } from '../pets/pets.service';
import { AdoptionRequestsService } from './adoption-requests.service';
import { ApproveAdoptionUseCase, ShareContactUseCase, RejectAdoptionUseCase } from './use-cases';

import { AdoptionRequestSimulationService, ManageAdoptionRequestsService } from './services';
import { MockUserPersistenceService } from '../mock-auth';
import { AdoptionRequestStatus } from './models/adoption-request-status';

type DbAdoptionRequest = {
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
};

describe('Servico de solicitacoes de adocao', () => {
  let service: AdoptionRequestsService;
  let records: DbAdoptionRequest[];
  let petsById: Map<string, PetForAdoptionRequest>;
  let prismaMock: {
    adoptionRequest: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
    user: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      upsert: jest.Mock;
    };
    pet: {
      findUnique: jest.Mock;
      upsert: jest.Mock;
      updateMany: jest.Mock;
      update: jest.Mock;
    };
    petHistory: {
      create: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(() => {
    petsById = new Map<string, PetForAdoptionRequest>([
      [
        'pet-001',
        {
          id: 'pet-001',
          name: 'Mimi',
          species: 'CAT',
          city: 'Sao Paulo',
          state: 'SP',
          responsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
          sourceType: 'ONG',
          sourceName: 'ONG Patas do Centro',
          adoptionStatus: 'AVAILABLE',
        },
      ],
      [
        'pet-002',
        {
          id: 'pet-002',
          name: 'Rex',
          species: 'DOG',
          city: 'Sao Paulo',
          state: 'SP',
          responsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
          sourceType: 'ONG',
          sourceName: 'ONG Patas do Centro',
          adoptionStatus: 'AVAILABLE',
        },
      ],
    ]);

    records = [];
    let index = 0;

    prismaMock = {
      adoptionRequest: {
        findMany: jest.fn((args?: { where?: { responsibleUserId?: string } }) => {
          const filtered = args?.where?.responsibleUserId
            ? records.filter((record) => record.responsibleUserId === args.where?.responsibleUserId)
            : records;

          return [...filtered].sort(
            (left, right) => right.requestedAt.getTime() - left.requestedAt.getTime(),
          );
        }),
        findFirst: jest.fn(
          (args: {
            where: { adopterId?: string; responsibleUserId?: string };
            select?: { id?: boolean };
          }) => {
            const found =
              records.find((record) => {
                const matchesAdopterId = args.where.adopterId
                  ? record.adopterId === args.where.adopterId
                  : true;
                const matchesResponsibleUserId = args.where.responsibleUserId
                  ? record.responsibleUserId === args.where.responsibleUserId
                  : true;
                return matchesAdopterId && matchesResponsibleUserId;
              }) ?? null;

            if (!found || !args.select?.id) {
              return found;
            }

            return { id: found.id };
          },
        ),
        create: jest.fn(
          (args: {
            data: Omit<DbAdoptionRequest, 'id' | 'requestedAt' | 'updatedAt' | 'note'> & {
              note?: string | null;
            };
          }) => {
            index += 1;
            const now = new Date();
            const created: DbAdoptionRequest = {
              id: `req-${index}`,
              requestedAt: now,
              updatedAt: now,
              note: args.data.note ?? null,
              ...args.data,
            };
            records.unshift(created);
            return created;
          },
        ),
        findUnique: jest.fn(
          (args: { where: { id: string } }) =>
            records.find((record) => record.id === args.where.id) ?? null,
        ),
        update: jest.fn(
          (args: {
            where: { id: string };
            data: Partial<Pick<DbAdoptionRequest, 'status' | 'note'>>;
          }) => {
            const recordIndex = records.findIndex((record) => record.id === args.where.id);

            if (recordIndex === -1) {
              throw new Error('Record not found');
            }

            const updated: DbAdoptionRequest = {
              ...records[recordIndex],
              ...args.data,
              updatedAt: new Date(),
            };
            records[recordIndex] = updated;
            return updated;
          },
        ),
        updateMany: jest.fn(
          (args: {
            where: {
              petId?: string;
              id?: { not?: string };
              status?: AdoptionRequestStatus;
            };
            data: Partial<Pick<DbAdoptionRequest, 'status' | 'note'>>;
          }) => {
            let count = 0;

            records = records.map((record) => {
              const matchesPetId = args.where.petId ? record.petId === args.where.petId : true;
              const matchesNotId = args.where.id?.not ? record.id !== args.where.id.not : true;
              const matchesStatus = args.where.status ? record.status === args.where.status : true;

              if (!matchesPetId || !matchesNotId || !matchesStatus) {
                return record;
              }

              count += 1;
              return {
                ...record,
                ...args.data,
                updatedAt: new Date(),
              };
            });

            return { count };
          },
        ),
      },
      user: {
        findMany: jest.fn(() => []),
        findUnique: jest.fn(() => null),
        upsert: jest.fn((args: { create: { id: string } }) => ({ id: args.create.id })),
      },
      pet: {
        findUnique: jest.fn((args: { where: { id: string } }) => {
          const pet = petsById.get(args.where.id);

          if (!pet) {
            return null;
          }

          return {
            id: pet.id,
            status:
              pet.adoptionStatus === 'ADOPTED'
                ? 'ADOPTED'
                : pet.adoptionStatus === 'IN_PROCESS'
                  ? 'PENDING_ADOPTION'
                  : pet.adoptionStatus,
          };
        }),
        upsert: jest.fn(
          (args: {
            where: { id: string };
            create: { id: string; status: string };
            update: { status: string };
          }) => ({
            id: args.where.id,
            status: args.update.status ?? args.create.status,
          }),
        ),
        update: jest.fn(
          (args: {
            where: { id: string };
            data: { responsibleUserId?: string; status?: string };
          }) => {
            const pet = petsById.get(args.where.id);
            if (pet) {
              if (args.data.responsibleUserId) {
                pet.responsibleUserId = args.data.responsibleUserId;
              }
              if (args.data.status) {
                pet.adoptionStatus =
                  args.data.status === 'ADOPTED'
                    ? 'ADOPTED'
                    : (args.data.status as typeof pet.adoptionStatus);
              }
            }
            return {
              id: args.where.id,
              responsibleUserId: args.data.responsibleUserId,
              status: args.data.status,
            };
          },
        ),
        updateMany: jest.fn(
          (args: {
            where: {
              id: string;
              status?: { in?: string[] } | string;
              responsibleUserId?: string;
            };
            data: { responsibleUserId?: string; status?: string };
          }) => {
            const pet = petsById.get(args.where.id);
            if (!pet) {
              return { count: 0 };
            }

            const statusMatches =
              !args.where.status ||
              (typeof args.where.status === 'object' &&
                'in' in args.where.status &&
                (args.where.status.in as string[]).includes(pet.adoptionStatus)) ||
              (typeof args.where.status === 'string' && args.where.status === pet.adoptionStatus);

            const responsibleUserMatches =
              !args.where.responsibleUserId ||
              args.where.responsibleUserId === pet.responsibleUserId;

            if (!statusMatches || !responsibleUserMatches) {
              return { count: 0 };
            }

            if (args.data.responsibleUserId) {
              pet.responsibleUserId = args.data.responsibleUserId;
            }
            if (args.data.status) {
              pet.adoptionStatus =
                args.data.status === 'ADOPTED'
                  ? 'ADOPTED'
                  : (args.data.status as typeof pet.adoptionStatus);
            }

            return { count: 1 };
          },
        ),
      },
      petHistory: {
        create: jest.fn(() => ({
          id: 'history-001',
          petId: 'pet-001',
          eventType: 'ADOPTION_APPROVED',
        })),
      },

      $transaction: jest.fn(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (callback: (tx: any) => Promise<any>) => {
          return callback(prismaMock);
        },
      ),
    };

    const petsServiceMock = {
      findByIdForAdoption: jest.fn((id: string) => petsById.get(id) ?? null),
      finalizeAdoption: jest.fn((id: string, newResponsibleUserId: string) => {
        const pet = petsById.get(id);

        if (!pet) {
          throw new Error(`Pet with id "${id}" not found`);
        }

        const updatedPet = {
          ...pet,
          adoptionStatus: 'ADOPTED' as const,
          responsibleUserId: newResponsibleUserId,
        };

        petsById.set(id, updatedPet);
        return {
          pet: updatedPet,
          previousResponsibleUserId: pet.responsibleUserId,
        };
      }),
    } as unknown as PetsService;

    const approveAdoptionUseCaseMock = new ApproveAdoptionUseCase(
      prismaMock as unknown as PrismaService,
      petsServiceMock,
    );

    const shareContactUseCaseMock = new ShareContactUseCase(prismaMock as unknown as PrismaService);

    const rejectAdoptionUseCaseMock = new RejectAdoptionUseCase(
      prismaMock as unknown as PrismaService,
    );

    const userPersistence = new MockUserPersistenceService(prismaMock as unknown as PrismaService);
    const simulationService = new AdoptionRequestSimulationService(
      prismaMock as unknown as PrismaService,
      userPersistence,
      petsServiceMock,
    );

    const manageService = new ManageAdoptionRequestsService(
      prismaMock as unknown as PrismaService,
      approveAdoptionUseCaseMock,
      shareContactUseCaseMock,
      rejectAdoptionUseCaseMock,
    );

    service = new AdoptionRequestsService(
      prismaMock as unknown as PrismaService,
      simulationService,
      manageService,
      petsServiceMock,
      userPersistence,
    );
  });

  it('deve simular solicitacao usando um usuario mock existente como adotante', async () => {
    const result = await service.simulateReceived(mockUserIds.ONG_PATAS_DO_CENTRO, {
      petId: 'pet-001',
      petResponsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
      adopterId: mockUserIds.RAFAEL_LIMA,
      responsibleContactShareConsent: true,
    });

    expect(result.data.adopter.id).toBe(mockUserIds.RAFAEL_LIMA);
    expect(result.data.adopter.name).toBe('Rafael Lima');
  });

  it('deve bloquear compartilhamento sem autorizacao do adotante', async () => {
    const simulated = await service.simulateReceived(mockUserIds.ONG_PATAS_DO_CENTRO, {
      petId: 'pet-001',
      petResponsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
      responsibleContactShareConsent: false,
    });

    await expect(
      service.manageReceived(simulated.data.id, mockUserIds.ONG_PATAS_DO_CENTRO, {
        action: 'share_contact',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve permitir simulacao direta com contato compartilhado para facilitar testes', async () => {
    const simulated = await service.simulateReceived(mockUserIds.ONG_PATAS_DO_CENTRO, {
      petId: 'pet-001',
      petResponsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
      responsibleContactShareConsent: true,
      initialStatus: AdoptionRequestStatus.CONTACT_SHARED,
    });

    const approved = await service.manageReceived(
      simulated.data.id,
      mockUserIds.ONG_PATAS_DO_CENTRO,
      {
        action: 'approve',
        note: 'Adocao concluida apos visita presencial.',
      },
    );

    expect(simulated.data.status).toBe('CONTACT_SHARED');
    expect(approved.data.status).toBe('APPROVED');
    expect(approved.data.note).toBe('Adocao concluida apos visita presencial.');
    expect(petsById.get('pet-001')?.adoptionStatus).toBe('ADOPTED');
    expect(petsById.get('pet-001')?.responsibleUserId).toBe(approved.data.adopter.id);
    expect(prismaMock.petHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          petId: 'pet-001',
          eventType: 'ADOPTION_APPROVED',
        }),
      }),
    );
  });

  it('deve bloquear nova solicitacao quando o pet ja estiver adotado', async () => {
    const adoptedPet = petsById.get('pet-001');

    if (!adoptedPet) {
      throw new Error('Pet de teste não encontrado');
    }

    petsById.set('pet-001', {
      ...adoptedPet,
      adoptionStatus: 'ADOPTED',
    });

    await expect(
      service.simulateReceived(mockUserIds.ONG_PATAS_DO_CENTRO, {
        petId: 'pet-001',
        petResponsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
        adopterId: mockUserIds.RAFAEL_LIMA,
        responsibleContactShareConsent: true,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve recusar automaticamente solicitacoes pendentes do mesmo pet apos aprovacao', async () => {
    const sharedContact = await service.simulateReceived(mockUserIds.ONG_PATAS_DO_CENTRO, {
      petId: 'pet-001',
      petResponsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
      adopterId: mockUserIds.RAFAEL_LIMA,
      responsibleContactShareConsent: true,
      initialStatus: AdoptionRequestStatus.CONTACT_SHARED,
    });

    const pendingRequest = await service.simulateReceived(mockUserIds.ONG_PATAS_DO_CENTRO, {
      petId: 'pet-001',
      petResponsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
      adopterId: mockUserIds.ANA_SOUZA,
      responsibleContactShareConsent: true,
      initialStatus: AdoptionRequestStatus.PENDING,
    });

    const approved = await service.manageReceived(
      sharedContact.data.id,
      mockUserIds.ONG_PATAS_DO_CENTRO,
      {
        action: 'approve',
        note: 'Adoção concluída com sucesso.',
      },
    );

    const allRequests = await service.findReceived(mockUserIds.ONG_PATAS_DO_CENTRO);
    const autoRejected = allRequests.data.find((request) => request.id === pendingRequest.data.id);

    expect(approved.message).toContain('recusadas automaticamente');
    expect(autoRejected?.status).toBe('REJECTED');
    expect(autoRejected?.note).toBe(
      'Solicitação encerrada automaticamente porque este pet já foi adotado.',
    );
  });

  it('deve impedir que o mesmo adotante abra mais de uma solicitacao para o mesmo doador', async () => {
    await service.simulateReceived(mockUserIds.ONG_PATAS_DO_CENTRO, {
      petId: 'pet-001',
      petResponsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
      adopterId: mockUserIds.RAFAEL_LIMA,
      responsibleContactShareConsent: true,
    });

    await expect(
      service.simulateReceived(mockUserIds.ONG_PATAS_DO_CENTRO, {
        petId: 'pet-002',
        petResponsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
        adopterId: mockUserIds.RAFAEL_LIMA,
        responsibleContactShareConsent: true,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve randomizar adotante mock quando o adopterId nao for informado', async () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.99);

    try {
      const simulated = await service.simulateReceived(mockUserIds.ONG_PATAS_DO_CENTRO, {
        petId: 'pet-001',
        petResponsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
        responsibleContactShareConsent: true,
      });

      expect(simulated.data.adopter.id).toBe(mockUserIds.ANA_SOUZA);
    } finally {
      randomSpy.mockRestore();
    }
  });
});
