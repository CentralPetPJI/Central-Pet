import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AdoptionRequestsController } from './adoption-requests.controller';
import { AdoptionRequestsService } from './adoption-requests.service';
import { SessionGuard } from '@/modules/auth/guards/session.guard';

describe('AdoptionRequestsController', () => {
  let controller: AdoptionRequestsController;
  let adoptionRequestsServiceMock: {
    create: jest.Mock;
    findReceived: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
  };

  beforeEach(async () => {
    adoptionRequestsServiceMock = {
      create: jest.fn(),
      findReceived: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdoptionRequestsController],
      providers: [
        {
          provide: AdoptionRequestsService,
          useValue: adoptionRequestsServiceMock,
        },
      ],
    })
      .overrideGuard(SessionGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AdoptionRequestsController>(AdoptionRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
