import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { PetHistoryController } from './pet-history.controller';
import { PetHistoryService } from './pet-history.service';

describe('PetHistoryController', () => {
  let controller: PetHistoryController;

  const petHistoryServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPetId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PetHistoryController],
      providers: [
        {
          provide: PetHistoryService,
          useValue: petHistoryServiceMock,
        },
      ],
    }).compile();

    controller = module.get<PetHistoryController>(PetHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
