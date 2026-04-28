import { BadRequestException, NotFoundException, ValidationPipe } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mockUserIds } from '@/mocks';
import { PrismaService } from '@/prisma/prisma.service';
import { PersonalityTraitsService } from '../personality-traits/personality-traits.service';
import { UserPersistenceService } from '@/modules/users/user-persistence.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetsService } from './pets.service';
import { PetSeedService } from './pet-seed.service';

type PrismaPetRecord = {
  id: string;
  profilePhoto: string;
  galleryPhotosJson: string | null;
  name: string;
  ageText: string;
  species: 'DOG' | 'CAT';
  breed: string;
  sex: 'FEMALE' | 'MALE';
  size: 'SMALL' | 'MEDIUM' | 'LARGE';
  microchipped: boolean;
  vaccinated: boolean;
  neutered: boolean;
  dewormed: boolean;
  needsHealthCare: boolean;
  physicalLimitation: boolean;
  visualLimitation: boolean;
  hearingLimitation: boolean;
  selectedPersonalitiesJson: string;
  responsibleUserId: string | null;
  sourceType: 'ONG' | 'PESSOA_FISICA' | null;
  sourceName: string | null;
  status: 'AVAILABLE' | 'PENDING_ADOPTION' | 'ADOPTED' | 'UNAVAILABLE';
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type PrismaUserRecord = {
  id: string;
  fullName: string;
  city: string | null;
  state: string | null;
  deleted: boolean;
};

describe('PetsService', () => {
  let service: PetsService;
  let validationPipe: ValidationPipe;
  let records: PrismaPetRecord[];
  let userRecords: Map<string, PrismaUserRecord>;
  let prismaMock: {
    pet: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      upsert: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      upsert: jest.Mock;
      count: jest.Mock;
    };
  };

  const makeCreateDto = (): CreatePetDto => ({
    profilePhoto: 'data:image/png;base64,abc',
    galleryPhotos: ['data:image/png;base64,def'],
    name: 'Luna',
    age: '3 anos',
    species: 'dog',
    breed: 'SRD',
    sex: 'female',
    size: 'medium',
    microchipped: true,
    vaccinated: true,
    neutered: true,
    dewormed: true,
    needsHealthCare: false,
    physicalLimitation: false,
    visualLimitation: false,
    hearingLimitation: false,
    selectedPersonalities: ['playful', 'friendly'],
    sourceType: 'PESSOA_FISICA',
    sourceName: 'Rafael Lima',
  });

  const validateCreateDto = async (dto: unknown): Promise<CreatePetDto> => {
    const transformed: unknown = await validationPipe.transform(dto, {
      type: 'body',
      metatype: CreatePetDto,
    });

    return transformed as CreatePetDto;
  };

  const validateUpdateDto = async (dto: unknown): Promise<UpdatePetDto> => {
    const transformed: unknown = await validationPipe.transform(dto, {
      type: 'body',
      metatype: UpdatePetDto,
    });

    return transformed as UpdatePetDto;
  };

  beforeEach(() => {
    process.env.ENABLE_MOCK_PETS = 'false';
    const now = new Date('2026-04-10T00:00:00.000Z');

    records = [];
    userRecords = new Map([
      [
        mockUserIds.RAFAEL_LIMA,
        {
          id: mockUserIds.RAFAEL_LIMA,
          fullName: 'Rafael Lima',
          city: 'Sao Paulo',
          state: 'SP',
          deleted: false,
        },
      ],
      [
        mockUserIds.ANA_SOUZA,
        {
          id: mockUserIds.ANA_SOUZA,
          fullName: 'Ana Souza',
          city: 'Campinas',
          state: 'SP',
          deleted: false,
        },
      ],
    ]);

    prismaMock = {
      pet: {
        create: jest.fn(
          (args: { data: Omit<PrismaPetRecord, 'id' | 'createdAt' | 'updatedAt'> }) => {
            const created: PrismaPetRecord = {
              id: `pet-${records.length + 1}`,
              createdAt: now,
              updatedAt: now,
              ...args.data,
            };
            records.push(created);
            return created;
          },
        ),
        findMany: jest.fn(
          (args?: { where?: { responsibleUserId?: string; deleted?: boolean } }) => {
            return records.filter((record) => {
              const matchesResponsible = args?.where?.responsibleUserId
                ? record.responsibleUserId === args.where.responsibleUserId
                : true;
              const matchesDeleted =
                args?.where?.deleted !== undefined ? record.deleted === args.where.deleted : true;

              return matchesResponsible && matchesDeleted;
            });
          },
        ),
        findUnique: jest.fn((args: { where: { id: string }; select?: Record<string, boolean> }) => {
          const found = records.find((record) => record.id === args.where.id) ?? null;

          if (!found || !args.select) {
            return found;
          }

          return Object.fromEntries(
            Object.keys(args.select).map((key) => [key, found[key as keyof PrismaPetRecord]]),
          );
        }),
        update: jest.fn(
          (args: {
            where: { id: string };
            data: Partial<Omit<PrismaPetRecord, 'id' | 'createdAt'>>;
          }) => {
            const index = records.findIndex((record) => record.id === args.where.id);

            if (index === -1) {
              throw new Error('Record not found');
            }

            const updated: PrismaPetRecord = {
              ...records[index],
              ...args.data,
              updatedAt: new Date('2026-04-10T00:10:00.000Z'),
            };

            records[index] = updated;
            return updated;
          },
        ),
        upsert: jest.fn(),
      },
      user: {
        findUnique: jest.fn((args: { where: { id: string }; select?: Record<string, boolean> }) => {
          const found = userRecords.get(args.where.id) ?? null;

          if (!found || !args.select) {
            return found;
          }

          return Object.fromEntries(
            Object.keys(args.select).map((key) => [key, found[key as keyof PrismaUserRecord]]),
          );
        }),
        findMany: jest.fn(
          (args: {
            where?: { id?: { in?: string[] }; deleted?: boolean };
            select?: Record<string, boolean>;
          }) => {
            const users = Array.from(userRecords.values()).filter((record) => {
              const matchesIds = args.where?.id?.in?.length
                ? args.where.id.in.includes(record.id)
                : true;
              const matchesDeleted =
                args.where?.deleted !== undefined ? record.deleted === args.where.deleted : true;

              return matchesIds && matchesDeleted;
            });

            if (!args.select) {
              return users;
            }

            return users.map((user) =>
              Object.fromEntries(
                Object.keys(args.select!).map((key) => [key, user[key as keyof PrismaUserRecord]]),
              ),
            );
          },
        ),
        upsert: jest.fn((args: { create: { id: string } }) => {
          const existing = userRecords.get(args.create.id);
          const nextRecord: PrismaUserRecord = existing ?? {
            id: args.create.id,
            fullName: args.create.id,
            city: null,
            state: null,
            deleted: false,
          };
          userRecords.set(args.create.id, nextRecord);
          return nextRecord;
        }),
        count: jest.fn((args: { where: { id: string; deleted: boolean } }) =>
          userRecords.get(args.where.id)?.deleted === args.where.deleted ? 1 : 0,
        ),
      },
    };

    const personalityTraitsMock = {
      getTraitIds: jest.fn(() => ['playful', 'friendly', 'calm']),
    } as unknown as PersonalityTraitsService;

    // Provide a lightweight UserPersistenceService mock that uses the prismaMock helpers
    const userPersistenceMock = {
      validateUser: jest.fn(async (userId: string) => {
        // If the test's prisma mock already knows the user, return true
        const found = prismaMock.user.findUnique({ where: { id: userId } });
        if (found) return true;
        // Only upsert when the id is one of the project's mockUserIds (replicates UserPersistenceService behavior)
        const knownMockIds = Object.values(mockUserIds) as string[];
        if (knownMockIds.includes(userId) && typeof prismaMock.user.upsert === 'function') {
          await prismaMock.user.upsert({
            where: { id: userId },
            update: {},
            create: { id: userId },
          });
          return true;
        }
        throw new NotFoundException(`Usuário com id "${userId}" não encontrado`);
      }),
      ensureUsersExist: jest.fn(async (userIds: string[]) => {
        await Promise.all(userIds.map((id) => userPersistenceMock.validateUser(id)));
      }),
    } as unknown as UserPersistenceService;

    const seedServiceMock = {
      ensureSeed: jest.fn(async () => {}),
    } as unknown as PetSeedService;

    service = new PetsService(
      prismaMock as unknown as PrismaService,
      personalityTraitsMock,
      userPersistenceMock as unknown as UserPersistenceService,
      seedServiceMock,
    );

    validationPipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });
  });

  it('deve criar um pet com sucesso', async () => {
    const dto = await validateCreateDto(makeCreateDto());

    const result = await service.create(dto, mockUserIds.RAFAEL_LIMA);

    expect(result.message).toBe('Pet created successfully');
    expect(result.data.id).toBeDefined();
    expect(result.data.name).toBe('Luna');
    expect(result.data.species).toBe('dog');
    expect(result.data.city).toBe('Sao Paulo');
    expect(result.data.state).toBe('SP');
    expect(result.data.selectedPersonalities).toEqual(['playful', 'friendly']);
    expect(result.data.responsibleUserId).toBe(mockUserIds.RAFAEL_LIMA);
  });

  it('deve rejeitar city e state enviados na criacao porque nao fazem parte do DTO do pet', async () => {
    await expect(
      validateCreateDto({
        ...makeCreateDto(),
        city: 'Cidade enviada pelo cliente',
        state: 'RJ',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve rejeitar tutor, shelter e contact enviados na criacao porque nao fazem parte do DTO do pet', async () => {
    await expect(
      validateCreateDto({
        ...makeCreateDto(),
        tutor: 'Responsavel antigo',
        shelter: 'Abrigo antigo',
        contact: '(11) 90000-0000',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve rejeitar criação com responsibleUserId inexistente', async () => {
    const dto = await validateCreateDto(makeCreateDto());

    await expect(service.create(dto, 'missing-user-id')).rejects.toThrow(NotFoundException);
    expect(prismaMock.pet.create).not.toHaveBeenCalled();
  });

  it('deve rejeitar traços de personalidade inválidos na criação', async () => {
    const dto = await validateCreateDto({
      ...makeCreateDto(),
      selectedPersonalities: ['invalid-trait'],
    });

    await expect(service.create(dto, mockUserIds.RAFAEL_LIMA)).rejects.toThrow(BadRequestException);
  });

  it('deve listar pets filtrando por responsável', async () => {
    const dto1 = await validateCreateDto(makeCreateDto());
    await service.create(dto1, mockUserIds.RAFAEL_LIMA);
    const dto2 = await validateCreateDto({
      ...makeCreateDto(),
      name: 'Toto',
    });
    await service.create(dto2, mockUserIds.ANA_SOUZA);

    const result = await service.findAll(mockUserIds.RAFAEL_LIMA);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.name).toBe('Luna');
    expect(result.data[0]?.responsibleUserId).toBe(mockUserIds.RAFAEL_LIMA);
  });

  it('deve buscar um pet existente por id', async () => {
    const dto = await validateCreateDto(makeCreateDto());
    const created = await service.create(dto, mockUserIds.RAFAEL_LIMA);

    const result = await service.findOne(created.data.id);

    expect(result.message).toBe('Pet retrieved successfully');
    expect(result.data.id).toBe(created.data.id);
  });

  it('deve lançar NotFoundException quando pet não existir em findOne', async () => {
    await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('deve atualizar campos informados e manter os demais', async () => {
    const dto = await validateCreateDto(makeCreateDto());
    const created = await service.create(dto, mockUserIds.RAFAEL_LIMA);
    const updateDto = await validateUpdateDto({ name: 'Luna Renomeada', size: 'large' });

    const result = await service.update(created.data.id, updateDto);

    expect(result.data.name).toBe('Luna Renomeada');
    expect(result.data.size).toBe('large');
    expect(result.data.species).toBe(created.data.species);
  });

  it('deve rejeitar city e state enviados na edicao porque nao fazem parte do DTO do pet', async () => {
    await expect(
      validateUpdateDto({
        name: 'Luna Renomeada',
        city: 'Rio de Janeiro',
        state: 'RJ',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve rejeitar tutor, shelter e contact enviados na edicao porque nao fazem parte do DTO do pet', async () => {
    await expect(
      validateUpdateDto({
        name: 'Luna Renomeada',
        tutor: 'Responsavel antigo',
        shelter: 'Abrigo antigo',
        contact: '(11) 90000-0000',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve refletir mudanca de cidade e estado do usuario em pets existentes', async () => {
    const created = await service.create(
      await validateCreateDto(makeCreateDto()),
      mockUserIds.RAFAEL_LIMA,
    );
    userRecords.set(mockUserIds.RAFAEL_LIMA, {
      ...userRecords.get(mockUserIds.RAFAEL_LIMA)!,
      city: 'Santos',
      state: 'SP',
    });

    const result = await service.findOne(created.data.id);

    expect(result.data.city).toBe('Santos');
    expect(result.data.state).toBe('SP');
  });

  it('deve retornar null para adoção quando pet não tiver responsável', async () => {
    records.push({
      id: 'pet-no-owner',
      profilePhoto: '',
      galleryPhotosJson: '[]',
      name: 'Sem Dono',
      ageText: '1 ano',
      species: 'DOG',
      breed: 'SRD',
      sex: 'MALE',
      size: 'MEDIUM',
      microchipped: false,
      vaccinated: true,
      neutered: true,
      dewormed: true,
      needsHealthCare: false,
      physicalLimitation: false,
      visualLimitation: false,
      hearingLimitation: false,
      selectedPersonalitiesJson: '[]',
      responsibleUserId: null as unknown as string,
      sourceType: null as unknown as 'ONG',
      sourceName: null as unknown as string,
      status: 'AVAILABLE',
      deleted: false,
      createdAt: new Date('2026-04-10T00:00:00.000Z'),
      updatedAt: new Date('2026-04-10T00:00:00.000Z'),
    });

    const result = await service.findByIdForAdoption('pet-no-owner');

    expect(result).toBeNull();
  });

  it('deve derivar localizacao na listagem e em findByIdForAdoption', async () => {
    const created = await service.create(
      await validateCreateDto(makeCreateDto()),
      mockUserIds.RAFAEL_LIMA,
    );
    userRecords.set(mockUserIds.RAFAEL_LIMA, {
      ...userRecords.get(mockUserIds.RAFAEL_LIMA)!,
      city: 'Osasco',
      state: 'SP',
    });

    const listed = await service.findAll(mockUserIds.RAFAEL_LIMA);
    const forAdoption = await service.findByIdForAdoption(created.data.id);

    expect(listed.data[0]?.city).toBe('Osasco');
    expect(listed.data[0]?.state).toBe('SP');
    expect(forAdoption?.city).toBe('Osasco');
    expect(forAdoption?.state).toBe('SP');
  });

  it('deve retornar localizacao vazia quando o responsavel nao tiver city ou state', async () => {
    userRecords.set(mockUserIds.RAFAEL_LIMA, {
      ...userRecords.get(mockUserIds.RAFAEL_LIMA)!,
      city: null,
      state: null,
    });
    const created = await service.create(
      await validateCreateDto(makeCreateDto()),
      mockUserIds.RAFAEL_LIMA,
    );

    const result = await service.findOne(created.data.id);

    expect(result.data.city).toBe('');
    expect(result.data.state).toBe('');
  });

  it('deve finalizar adoção transferindo responsável e status', async () => {
    const dto = await validateCreateDto(makeCreateDto());
    const created = await service.create(dto, mockUserIds.RAFAEL_LIMA);

    const result = await service.finalizeAdoption(created.data.id, mockUserIds.ANA_SOUZA);

    expect(result.previousResponsibleUserId).toBe(mockUserIds.RAFAEL_LIMA);
    expect(result.pet.responsibleUserId).toBe(mockUserIds.ANA_SOUZA);
    expect(result.pet.adoptionStatus).toBe('ADOPTED');
  });

  it('deve realizar soft delete e ocultar pet das consultas', async () => {
    const dto = await validateCreateDto(makeCreateDto());
    const created = await service.create(dto, mockUserIds.RAFAEL_LIMA);

    const deleted = await service.remove(created.data.id);
    const listed = await service.findAll();

    expect(deleted.message).toBe('Pet deleted successfully');
    expect(deleted.data.adoptionStatus).toBe('UNAVAILABLE');
    await expect(service.findOne(created.data.id)).rejects.toThrow(NotFoundException);
    expect(listed.data.find((pet) => pet.id === created.data.id)).toBeUndefined();
  });
});
