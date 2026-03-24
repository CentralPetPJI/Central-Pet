import { Test, TestingModule } from '@nestjs/testing';
import { PetHistoryService } from './pet-history.service';

describe('PetHistoryService', () => {
  let service: PetHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PetHistoryService],
    }).compile();

    service = module.get<PetHistoryService>(PetHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
