import { Test, TestingModule } from '@nestjs/testing';
import { AdoptionRequestsController } from './adoption-requests.controller';

describe('AdoptionRequestsController', () => {
  let controller: AdoptionRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdoptionRequestsController],
    }).compile();

    controller = module.get<AdoptionRequestsController>(
      AdoptionRequestsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
