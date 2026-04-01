import { BadRequestException, NotFoundException, ValidationPipe } from '@nestjs/common';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PersonalityTraitsService } from '../personality-traits/personality-traits.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetsService } from './pets.service';

describe('PetsService', () => {
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

  it('should create a pet successfully', async () => {
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

  it('should create a pet with empty selectedPersonalities when omitted', async () => {
    const dto = await validateCreateDto({
      ...makeCreateDto(),
      selectedPersonalities: undefined,
    });

    const result = service.create(dto);

    expect(result.data.selectedPersonalities).toEqual([]);
  });

  it('should reject invalid personality traits on create', async () => {
    const dto = await validateCreateDto(makeCreateDto());
    dto.selectedPersonalities = ['playful', 'invalid-trait'];

    expect(() => service.create(dto)).toThrow(BadRequestException);
  });

  it('should list all created pets', async () => {
    const dto = await validateCreateDto(makeCreateDto());
    service.create(dto);

    const result = service.findAll();

    expect(result.message).toBe('Pets retrieved successfully');
    expect(result.data.length).toBe(1);
  });

  it('should find one existing pet', async () => {
    const dto = await validateCreateDto(makeCreateDto());
    const created = service.create(dto);

    const found = service.findOne(created.data.id);

    expect(found.message).toBe('Pet retrieved successfully');
    expect(found.data.id).toBe(created.data.id);
    expect(found.data.name).toBe('Luna');
  });

  it('should throw NotFoundException when pet does not exist on findOne', () => {
    expect(() => service.findOne('missing-id')).toThrow(NotFoundException);
  });

  it('should update an existing pet and preserve other fields', async () => {
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

  it('should reject invalid personality traits on update', async () => {
    const createDto = await validateCreateDto(makeCreateDto());
    const created = service.create(createDto);

    const updateDto = await validateUpdateDto({
      selectedPersonalities: ['invalid-trait'],
    });

    expect(() => service.update(created.data.id, updateDto)).toThrow(BadRequestException);
  });

  it('should throw NotFoundException when pet does not exist on update', async () => {
    const updateDto = await validateUpdateDto({ name: 'Novo Nome' });
    expect(() => service.update('missing-id', updateDto)).toThrow(NotFoundException);
  });

  it('should preserve selectedPersonalities when update payload omits the field', async () => {
    const createDto = await validateCreateDto(makeCreateDto());
    const created = service.create(createDto);

    const updateDto = await validateUpdateDto({
      name: 'Luna Renomeada',
    });

    const updated = service.update(created.data.id, updateDto);

    expect(updated.data.name).toBe('Luna Renomeada');
    expect(updated.data.selectedPersonalities).toEqual(created.data.selectedPersonalities);
  });

  it('should clear selectedPersonalities when update payload sends an empty array', () => {
    const created = service.create(makeCreateDto());

    const updated = service.update(created.data.id, {
      selectedPersonalities: [],
    });

    expect(updated.data.selectedPersonalities).toEqual([]);
  });

  describe('CreatePetDto validation', () => {
    it('should reject when galleryPhotos exceeds @ArrayMaxSize(10)', async () => {
      const dto = {
        ...makeCreateDto(),
        galleryPhotos: Array(11).fill('data:image/png;base64,test'),
      };

      await expect(validateCreateDto(dto)).rejects.toThrow();
    });

    it('should accept when galleryPhotos has exactly 10 items', async () => {
      const dto = {
        ...makeCreateDto(),
        galleryPhotos: Array(10).fill('data:image/png;base64,test'),
      };

      const validated = await validateCreateDto(dto);
      expect(validated.galleryPhotos?.length).toBe(10);
    });

    it('should reject when selectedPersonalities has duplicate values (@ArrayUnique)', async () => {
      const dto = {
        ...makeCreateDto(),
        selectedPersonalities: ['playful', 'playful', 'friendly'],
      };

      await expect(validateCreateDto(dto)).rejects.toThrow();
    });

    it('should accept when selectedPersonalities has unique values', async () => {
      const dto = {
        ...makeCreateDto(),
        selectedPersonalities: ['playful', 'friendly', 'calm'],
      };

      const validated = await validateCreateDto(dto);
      expect(validated.selectedPersonalities).toEqual(['playful', 'friendly', 'calm']);
    });
  });
});
