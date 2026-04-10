import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { mockUserIds } from '@/mocks';
import { PrismaService } from '@/prisma/prisma.service';
import { PetHistoryService } from '../pet-history/pet-history.service';
import { PetsService, type PetForAdoptionRequest } from '../pets/pets.service';
import { AdoptionRequestsService } from './adoption-requests.service';
import type { AdoptionRequestStatus } from './models/adoption-request-status';

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
  let petHistoryCreateMock: jest.Mock;
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
    };
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
        updateMany: jest.fn(() => ({ count: 1 })),
      },
    };

    petHistoryCreateMock = jest.fn(() => ({
      message: 'Pet history created successfully',
      data: {},
    }));

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

    service = new AdoptionRequestsService(prismaMock as unknown as PrismaService, petsServiceMock, {
      create: petHistoryCreateMock,
    } as unknown as PetHistoryService);
  });

  it('deve simular solicitacao usando um usuario mock existente como adotante', async () => {
    const result = await service.simulateReceived(mockUserIds.ONG_PATAS_DO_CENTRO, {
      petId: 'pet-001',
      petResponsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
      adopterId: mockUserIds.RAFAEL_LIMA,
      adopterContactShareConsent: true,
    });

    expect(result.data.adopter.id).toBe(mockUserIds.RAFAEL_LIMA);
    expect(result.data.adopter.name).toBe('Rafael Lima');
  });

  it('deve exigir compartilhamento de contato antes da aprovacao', async () => {
    const simulated = await service.simulateReceived(mockUserIds.ONG_PATAS_DO_CENTRO, {
      petId: 'pet-001',
      petResponsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
      adopterContactShareConsent: true,
    });

    await expect(
      service.manageReceived(simulated.data.id, mockUserIds.ONG_PATAS_DO_CENTRO, {
        action: 'approve',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve bloquear compartilhamento sem autorizacao do adotante', async () => {
    const simulated = await service.simulateReceived(mockUserIds.ONG_PATAS_DO_CENTRO, {
      petId: 'pet-001',
      petResponsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
      adopterContactShareConsent: false,
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
      adopterContactShareConsent: true,
      initialStatus: 'contact_shared',
    });

    const approved = await service.manageReceived(
      simulated.data.id,
      mockUserIds.ONG_PATAS_DO_CENTRO,
      {
        action: 'approve',
        note: 'Adocao concluida apos visita presencial.',
      },
    );

    expect(simulated.data.status).toBe('contact_shared');
    expect(approved.data.status).toBe('approved');
    expect(approved.data.note).toBe('Adocao concluida apos visita presencial.');
    expect(petsById.get('pet-001')?.adoptionStatus).toBe('ADOPTED');
    expect(petsById.get('pet-001')?.responsibleUserId).toBe(approved.data.adopter.id);
    expect(petHistoryCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        petId: 'pet-001',
        eventType: 'ADOPTION_APPROVED',
      }),
      mockUserIds.ONG_PATAS_DO_CENTRO,
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
        adopterContactShareConsent: true,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve recusar automaticamente solicitacoes pendentes do mesmo pet apos aprovacao', async () => {
    const sharedContact = await service.simulateReceived(mockUserIds.ONG_PATAS_DO_CENTRO, {
      petId: 'pet-001',
      petResponsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
      adopterId: mockUserIds.RAFAEL_LIMA,
      adopterContactShareConsent: true,
      initialStatus: 'contact_shared',
    });

    const pendingRequest = await service.simulateReceived(mockUserIds.ONG_PATAS_DO_CENTRO, {
      petId: 'pet-001',
      petResponsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
      adopterId: mockUserIds.ANA_SOUZA,
      adopterContactShareConsent: true,
      initialStatus: 'pending',
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

    expect(approved.message).toContain('foram recusadas automaticamente');
    expect(autoRejected?.status).toBe('rejected');
    expect(autoRejected?.note).toBe(
      'Solicitação encerrada automaticamente porque este pet já foi adotado.',
    );
  });

  it('deve impedir que o mesmo adotante abra mais de uma solicitacao para o mesmo doador', async () => {
    await service.simulateReceived(mockUserIds.ONG_PATAS_DO_CENTRO, {
      petId: 'pet-001',
      petResponsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
      adopterId: mockUserIds.RAFAEL_LIMA,
      adopterContactShareConsent: true,
    });

    await expect(
      service.simulateReceived(mockUserIds.ONG_PATAS_DO_CENTRO, {
        petId: 'pet-001',
        petResponsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
        adopterId: mockUserIds.RAFAEL_LIMA,
        adopterContactShareConsent: true,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve randomizar adotante mock quando o adopterId nao for informado', async () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.99);

    try {
      const simulated = await service.simulateReceived(mockUserIds.ONG_PATAS_DO_CENTRO, {
        petId: 'pet-001',
        petResponsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
        adopterContactShareConsent: true,
      });

      expect(simulated.data.adopter.id).toBe(mockUserIds.ANA_SOUZA);
    } finally {
      randomSpy.mockRestore();
    }
  });
});
