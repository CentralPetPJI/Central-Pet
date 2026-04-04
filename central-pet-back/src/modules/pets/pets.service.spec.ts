import { BadRequestException, NotFoundException, ValidationPipe } from '@nestjs/common';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PersonalityTraitsService } from '../personality-traits/personality-traits.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { mockUserIds } from '@/mocks';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetsService } from './pets.service';

describe('Servico de pets', () => {
  let service: PetsService;
  let validationPipe: ValidationPipe;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PetsService, PersonalityTraitsService],
    }).compile();

    service = module.get<PetsService>(PetsService);
    validationPipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });
  });

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
    city: 'Sao Paulo - SP',
    contact: '(11) 99999-0000',
    vaccinated: true,
    neutered: true,
    dewormed: true,
    needsHealthCare: false,
    physicalLimitation: false,
    visualLimitation: false,
    hearingLimitation: false,
    selectedPersonalities: ['playful', 'friendly'],
    responsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
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

  it('deve criar um pet com sucesso', async () => {
    const dto = await validateCreateDto(makeCreateDto());
    const result = service.create(dto);

    expect(result.message).toBe('Pet created successfully');
    expect(result.data.id).toBeDefined();
    expect(result.data.name).toBe('Luna');
    expect(result.data.species).toBe('dog');
    expect(result.data.selectedPersonalities).toEqual(['playful', 'friendly']);
    expect(result.data.createdAt).toBeDefined();
    expect(result.data.updatedAt).toBeDefined();
  });

  it('deve criar um pet com selectedPersonalities vazio quando omitido', async () => {
    const dto = await validateCreateDto({
      ...makeCreateDto(),
      selectedPersonalities: undefined,
    });

    const result = service.create(dto);

    expect(result.data.selectedPersonalities).toEqual([]);
  });

  it('deve rejeitar traços de personalidade invalidos na criacao', async () => {
    const dto = await validateCreateDto(makeCreateDto());
    dto.selectedPersonalities = ['playful', 'invalid-trait'];

    expect(() => service.create(dto)).toThrow(BadRequestException);
  });

  it('deve listar todos os pets criados', async () => {
    const dto = await validateCreateDto(makeCreateDto());
    service.create(dto);

    const result = service.findAll();

    expect(result.message).toBe('Pets retrieved successfully');
    expect(result.data.length).toBe(1);
  });

  it('deve encontrar um pet existente', async () => {
    const dto = await validateCreateDto(makeCreateDto());
    const created = service.create(dto);

    const found = service.findOne(created.data.id);

    expect(found.message).toBe('Pet retrieved successfully');
    expect(found.data.id).toBe(created.data.id);
    expect(found.data.name).toBe('Luna');
  });

  it('deve lançar NotFoundException quando o pet nao existir no findOne', () => {
    expect(() => service.findOne('missing-id')).toThrow(NotFoundException);
  });

  it('deve atualizar um pet existente e preservar os demais campos', async () => {
    const createDto = await validateCreateDto(makeCreateDto());
    const created = service.create(createDto);

    const updateDto = await validateUpdateDto({
      name: 'Jones',
      selectedPersonalities: ['playful', 'friendly'],
    });

    const updated = service.update(created.data.id, updateDto);

    expect(updated.message).toBe('Pet updated successfully');
    expect(updated.data.id).toBe(created.data.id);
    expect(updated.data.name).toBe('Jones');
    expect(updated.data.selectedPersonalities).toEqual(['playful', 'friendly']);
    expect(updated.data.profilePhoto).toBe(created.data.profilePhoto);
    expect(updated.data.species).toBe(created.data.species);
    expect(updated.data.breed).toBe(created.data.breed);
    expect(updated.data.city).toBe(created.data.city);
    expect(updated.data.contact).toBe(created.data.contact);
    expect(updated.data.updatedAt).toBeDefined();
    expect(new Date(updated.data.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(created.data.updatedAt).getTime(),
    );
  });

  it('deve rejeitar traços de personalidade invalidos na atualizacao', async () => {
    const createDto = await validateCreateDto(makeCreateDto());
    const created = service.create(createDto);

    const updateDto = await validateUpdateDto({
      selectedPersonalities: ['invalid-trait'],
    });

    expect(() => service.update(created.data.id, updateDto)).toThrow(BadRequestException);
  });

  it('deve lançar NotFoundException quando o pet nao existir na atualizacao', async () => {
    const updateDto = await validateUpdateDto({ name: 'Novo Nome' });
    expect(() => service.update('missing-id', updateDto)).toThrow(NotFoundException);
  });

  it('deve preservar selectedPersonalities quando o payload de atualizacao omitir o campo', async () => {
    const createDto = await validateCreateDto(makeCreateDto());
    const created = service.create(createDto);

    const updateDto = await validateUpdateDto({
      name: 'Luna Renomeada',
    });

    const updated = service.update(created.data.id, updateDto);

    expect(updated.data.name).toBe('Luna Renomeada');
    expect(updated.data.selectedPersonalities).toEqual(created.data.selectedPersonalities);
  });

  it('deve limpar selectedPersonalities quando o payload de atualizacao enviar um array vazio', () => {
    const created = service.create(makeCreateDto());

    const updated = service.update(created.data.id, {
      selectedPersonalities: [],
    });

    expect(updated.data.selectedPersonalities).toEqual([]);
  });

  describe('CreatePetDto validation', () => {
    it('deve rejeitar quando galleryPhotos exceder @ArrayMaxSize(10)', async () => {
      const dto = {
        ...makeCreateDto(),
        galleryPhotos: Array(11).fill('data:image/png;base64,test'),
      };

      await expect(validateCreateDto(dto)).rejects.toThrow();
    });

    it('deve aceitar quando galleryPhotos tiver exatamente 10 itens', async () => {
      const dto = {
        ...makeCreateDto(),
        galleryPhotos: Array(10).fill('data:image/png;base64,test'),
      };

      const validated = await validateCreateDto(dto);
      expect(validated.galleryPhotos?.length).toBe(10);
    });

    it('deve rejeitar quando selectedPersonalities tiver valores duplicados (@ArrayUnique)', async () => {
      const dto = {
        ...makeCreateDto(),
        selectedPersonalities: ['playful', 'playful', 'friendly'],
      };

      await expect(validateCreateDto(dto)).rejects.toThrow();
    });

    it('deve aceitar quando selectedPersonalities tiver valores unicos', async () => {
      const dto = {
        ...makeCreateDto(),
        selectedPersonalities: ['playful', 'friendly', 'calm'],
      };

      const validated = await validateCreateDto(dto);
      expect(validated.selectedPersonalities).toEqual(['playful', 'friendly', 'calm']);
    });
  });
});
