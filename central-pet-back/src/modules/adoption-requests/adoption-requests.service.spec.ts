import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mockUserIds } from '@/mocks';
import { AdoptionRequestsService } from './adoption-requests.service';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

describe('Servico de solicitacoes de adocao', () => {
  let service: AdoptionRequestsService;

  beforeEach(() => {
    service = new AdoptionRequestsService();
  });

  it('deve retornar todas as solicitacoes recebidas ordenadas da mais recente para a mais antiga', () => {
    const result = service.findReceived();

    expect(result.message).toBe('Received adoption requests retrieved successfully');
    expect(result.data).toHaveLength(4);

    // Verifica se a lista está ordenada por data em ordem decrescente (mais recente primeiro)
    const timestamps = result.data.map((request) => new Date(request.requestedAt).getTime());
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i]).toBeLessThanOrEqual(timestamps[i - 1]);
    }
  });

  it('deve filtrar solicitacoes de adocao por id do usuario responsavel', () => {
    const result = service.findReceived(mockUserIds.ONG_PATAS_DO_CENTRO);

    expect(result.data).toHaveLength(2);
    expect(
      result.data.every(
        (request) => request.pet.responsibleUserId === mockUserIds.ONG_PATAS_DO_CENTRO,
      ),
    ).toBe(true);
  });

  it('deve retornar solicitacoes para uma pessoa fisica', () => {
    const result = service.findReceived(mockUserIds.JULIANA_MARTINS);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.pet.sourceType).toBe('PESSOA_FISICA');
    expect(result.data[0]?.pet.sourceName).toBe('Juliana Martins');
  });

  it('deve retornar lista vazia quando nao houver solicitacoes recebidas para o usuario', () => {
    const result = service.findReceived('99999999-9999-9999-9999-999999999999');

    expect(result.data).toEqual([]);
  });
});

describe('AdoptionRequestsService - Prisma methods', () => {
  type PetFindUnique = (
    args: unknown,
  ) => Promise<{ id: string; name: string; status: string } | null>;
  type UserFindUnique = (
    args: unknown,
  ) => Promise<{ id: string; fullName: string; email: string } | null>;
  type AdoptionRequestCreate = (args: unknown) => Promise<unknown>;
  type AdoptionRequestFindMany = (args: unknown) => Promise<unknown[]>;
  type AdoptionRequestFindUnique = (args: unknown) => Promise<Record<string, unknown> | null>;

  let prismaService: AdoptionRequestsService;
  let petFindUniqueMock: jest.MockedFunction<PetFindUnique>;
  let userFindUniqueMock: jest.MockedFunction<UserFindUnique>;
  let adoptionRequestCreateMock: jest.MockedFunction<AdoptionRequestCreate>;
  let adoptionRequestFindManyMock: jest.MockedFunction<AdoptionRequestFindMany>;
  let adoptionRequestFindUniqueMock: jest.MockedFunction<AdoptionRequestFindUnique>;

  beforeEach(() => {
    petFindUniqueMock = jest.fn<PetFindUnique>();
    userFindUniqueMock = jest.fn<UserFindUnique>();
    adoptionRequestCreateMock = jest.fn<AdoptionRequestCreate>();
    adoptionRequestFindManyMock = jest.fn<AdoptionRequestFindMany>();
    adoptionRequestFindUniqueMock = jest.fn<AdoptionRequestFindUnique>();

    const prismaMock = {
      pet: {
        findUnique: petFindUniqueMock,
      },
      user: {
        findUnique: userFindUniqueMock,
      },
      adoptionRequest: {
        create: adoptionRequestCreateMock,
        findMany: adoptionRequestFindManyMock,
        findUnique: adoptionRequestFindUniqueMock,
      },
    };

    prismaService = new AdoptionRequestsService(prismaMock as unknown as PrismaService);
  });

  it('should throw when pet does not exist on create', async () => {
    petFindUniqueMock.mockResolvedValue(null);

    await expect(
      prismaService.create({
        petId: '11111111-1111-1111-1111-111111111111',
        requesterId: '22222222-2222-2222-2222-222222222222',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw when requester does not exist on create', async () => {
    petFindUniqueMock.mockResolvedValue({
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Luna',
      status: 'AVAILABLE',
    });
    userFindUniqueMock.mockResolvedValue(null);

    await expect(
      prismaService.create({
        petId: '11111111-1111-1111-1111-111111111111',
        requesterId: '22222222-2222-2222-2222-222222222222',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should return all adoption requests', async () => {
    adoptionRequestFindManyMock.mockResolvedValue([]);

    const result = await prismaService.findAll();

    expect(result.message).toBe('Adoption requests retrieved successfully');
    expect(result.data).toEqual([]);
  });
});
