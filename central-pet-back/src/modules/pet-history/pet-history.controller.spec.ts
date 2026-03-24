import { Test, TestingModule } from '@nestjs/testing';
import { PetHistoryController } from './pet-history.controller';

describe('PetHistoryController', () => {
  let controller: PetHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PetHistoryController],
    }).compile();

    controller = module.get<PetHistoryController>(PetHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
