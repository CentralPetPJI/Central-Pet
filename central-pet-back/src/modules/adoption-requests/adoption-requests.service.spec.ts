import { Test, TestingModule } from '@nestjs/testing';
import { AdoptionRequestsService } from './adoption-requests.service';

describe('AdoptionRequestsService', () => {
  let service: AdoptionRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdoptionRequestsService],
    }).compile();

    service = module.get<AdoptionRequestsService>(AdoptionRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
