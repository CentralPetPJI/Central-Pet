import { BadRequestException, NotFoundException, ValidationPipe } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mockUserIds } from '@/mocks';
import { PrismaService } from '@/prisma/prisma.service';
import { PersonalityTraitsService } from '../personality-traits/personality-traits.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetsService } from './pets.service';

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
  tutor: string;
  shelter: string;
  city: string;
  state: string | null;
  contact: string;
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
  createdAt: Date;
  updatedAt: Date;
};

describe('PetsService', () => {
  let service: PetsService;
  let validationPipe: ValidationPipe;
  let records: PrismaPetRecord[];
  let persistedUserIds: Set<string>;
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
      upsert: jest.Mock;
    };
  };

  const makeCreateDto = (): CreatePetDto => ({
    profilePhoto: 'data:image/png;base64,abc',
    galleryPhotos: ['data:image/png;base64,def'],
    name: 'Luna',
    age: '3 anos',
    species: 'dog',
    breed: 'SRD',
    sex: 'Femea',
    size: 'Medio',
    microchipped: true,
    tutor: 'ONG Patas do Centro',
    shelter: 'Abrigo Reencontro',
    city: 'Sao Paulo',
    state: 'SP',
    contact: '(11) 99999-0000',
    vaccinated: true,
    neutered: true,
    dewormed: true,
    needsHealthCare: false,
    physicalLimitation: false,
    visualLimitation: false,
    hearingLimitation: false,
    responsibleUserId: mockUserIds.RAFAEL_LIMA,
    selectedPersonalities: ['playful', 'friendly'],
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
    persistedUserIds = new Set();

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
        findMany: jest.fn((args?: { where?: { responsibleUserId?: string } }) => {
          if (!args?.where?.responsibleUserId) {
            return [...records];
          }

          return records.filter(
            (record) => record.responsibleUserId === args.where?.responsibleUserId,
          );
        }),
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
        findUnique: jest.fn((args: { where: { id: string } }) =>
          persistedUserIds.has(args.where.id) ? { id: args.where.id } : null,
        ),
        upsert: jest.fn((args: { create: { id: string } }) => {
          persistedUserIds.add(args.create.id);
          return { id: args.create.id };
        }),
      },
    };

    const personalityTraitsMock = {
      getTraitIds: jest.fn(() => ['playful', 'friendly', 'calm']),
    } as unknown as PersonalityTraitsService;

    service = new PetsService(prismaMock as unknown as PrismaService, personalityTraitsMock);

    validationPipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });
  });

  it('deve criar um pet com sucesso', async () => {
    const dto = await validateCreateDto(makeCreateDto());

    const result = await service.create(dto);

    expect(result.message).toBe('Pet created successfully');
    expect(result.data.id).toBeDefined();
    expect(result.data.name).toBe('Luna');
    expect(result.data.species).toBe('dog');
    expect(result.data.selectedPersonalities).toEqual(['playful', 'friendly']);
    expect(result.data.responsibleUserId).toBe(mockUserIds.RAFAEL_LIMA);
  });

  it('deve rejeitar criação com responsibleUserId inexistente', async () => {
    const dto = await validateCreateDto({
      ...makeCreateDto(),
      responsibleUserId: 'missing-user-id',
    });

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    expect(prismaMock.pet.create).not.toHaveBeenCalled();
  });

  it('deve rejeitar traços de personalidade inválidos na criação', async () => {
    const dto = await validateCreateDto({
      ...makeCreateDto(),
      selectedPersonalities: ['invalid-trait'],
    });

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('deve listar pets filtrando por responsável', async () => {
    await service.create(await validateCreateDto(makeCreateDto()));
    await service.create(
      await validateCreateDto({
        ...makeCreateDto(),
        name: 'Toto',
        responsibleUserId: mockUserIds.ANA_SOUZA,
      }),
    );

    const result = await service.findAll(mockUserIds.RAFAEL_LIMA);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.name).toBe('Luna');
    expect(result.data[0]?.responsibleUserId).toBe(mockUserIds.RAFAEL_LIMA);
  });

  it('deve buscar um pet existente por id', async () => {
    const created = await service.create(await validateCreateDto(makeCreateDto()));

    const result = await service.findOne(created.data.id);

    expect(result.message).toBe('Pet retrieved successfully');
    expect(result.data.id).toBe(created.data.id);
  });

  it('deve lançar NotFoundException quando pet não existir em findOne', async () => {
    await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('deve atualizar campos informados e manter os demais', async () => {
    const created = await service.create(await validateCreateDto(makeCreateDto()));
    const updateDto = await validateUpdateDto({ name: 'Luna Renomeada', size: 'Grande' });

    const result = await service.update(created.data.id, updateDto);

    expect(result.data.name).toBe('Luna Renomeada');
    expect(result.data.size).toBe('Grande');
    expect(result.data.species).toBe(created.data.species);
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
      tutor: 'Tutor',
      shelter: 'Abrigo',
      city: 'Sao Paulo',
      state: 'SP',
      contact: 'Contato',
      vaccinated: true,
      neutered: true,
      dewormed: true,
      needsHealthCare: false,
      physicalLimitation: false,
      visualLimitation: false,
      hearingLimitation: false,
      selectedPersonalitiesJson: '[]',
      responsibleUserId: null,
      sourceType: null,
      sourceName: null,
      status: 'AVAILABLE',
      createdAt: new Date('2026-04-10T00:00:00.000Z'),
      updatedAt: new Date('2026-04-10T00:00:00.000Z'),
    });

    const result = await service.findByIdForAdoption('pet-no-owner');

    expect(result).toBeNull();
  });

  it('deve finalizar adoção transferindo responsável e status', async () => {
    const created = await service.create(await validateCreateDto(makeCreateDto()));

    const result = await service.finalizeAdoption(created.data.id, mockUserIds.ANA_SOUZA);

    expect(result.previousResponsibleUserId).toBe(mockUserIds.RAFAEL_LIMA);
    expect(result.pet.responsibleUserId).toBe(mockUserIds.ANA_SOUZA);
    expect(result.pet.adoptionStatus).toBe('ADOPTED');
  });
});
