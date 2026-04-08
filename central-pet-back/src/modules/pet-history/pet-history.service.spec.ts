import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PrismaService } from '../../prisma/prisma.service';
import { PetHistoryService } from './pet-history.service';

type PetFindUnique = (args: unknown) => Promise<{ id: string } | null>;
type UserFindUnique = (args: unknown) => Promise<{ id: string } | null>;
type PetHistoryCreate = (args: unknown) => Promise<unknown>;
type PetHistoryFindMany = (args: unknown) => Promise<unknown[]>;
type PetHistoryFindUnique = (args: unknown) => Promise<Record<string, unknown> | null>;

describe('PetHistoryService', () => {
  let service: PetHistoryService;

  let petFindUniqueMock: jest.MockedFunction<PetFindUnique>;
  let userFindUniqueMock: jest.MockedFunction<UserFindUnique>;
  let petHistoryCreateMock: jest.MockedFunction<PetHistoryCreate>;
  let petHistoryFindManyMock: jest.MockedFunction<PetHistoryFindMany>;
  let petHistoryFindUniqueMock: jest.MockedFunction<PetHistoryFindUnique>;

  beforeEach(() => {
    petFindUniqueMock = jest.fn<PetFindUnique>();
    userFindUniqueMock = jest.fn<UserFindUnique>();
    petHistoryCreateMock = jest.fn<PetHistoryCreate>();
    petHistoryFindManyMock = jest.fn<PetHistoryFindMany>();
    petHistoryFindUniqueMock = jest.fn<PetHistoryFindUnique>();

    const prismaMock = {
      pet: {
        findUnique: petFindUniqueMock,
      },
      user: {
        findUnique: userFindUniqueMock,
      },
      petHistory: {
        create: petHistoryCreateMock,
        findMany: petHistoryFindManyMock,
        findUnique: petHistoryFindUniqueMock,
      },
    };

    service = new PetHistoryService(prismaMock as unknown as PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw when pet does not exist on create', async () => {
    petFindUniqueMock.mockResolvedValue(null);

    await expect(
      service.create({
        petId: '11111111-1111-1111-1111-111111111111',
        eventType: 'CREATED',
        description: 'Pet created',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should return all pet history records', async () => {
    petHistoryFindManyMock.mockResolvedValue([]);

    const result = await service.findAll();

    expect(result.message).toBe('Pet history retrieved successfully');
    expect(result.data).toEqual([]);
  });
});
