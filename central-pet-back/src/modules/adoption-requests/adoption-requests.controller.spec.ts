import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AdoptionRequestsController } from './adoption-requests.controller';
import { AdoptionRequestsService } from './adoption-requests.service';

describe('AdoptionRequestsController', () => {
  let controller: AdoptionRequestsController;

  const adoptionRequestsServiceMock = {
    create: jest.fn(),
    findReceived: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdoptionRequestsController],
      providers: [
        {
          provide: AdoptionRequestsService,
          useValue: adoptionRequestsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AdoptionRequestsController>(AdoptionRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
