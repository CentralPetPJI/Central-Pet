import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { PrismaService } from '@/prisma/prisma.service';
import { PersonalityTraitsService } from '../personality-traits/personality-traits.service';
import { AuthService } from '../auth/auth.service';
import { UserPersistenceService } from '../users/user-persistence.service';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { PetSeedService } from './pet-seed.service';

describe('Controlador de pets', () => {
  let controller: PetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PetsController],
      providers: [
        PetsService,
        {
          provide: PrismaService,
          useValue: {
            pet: {},
            user: {},
          },
        },
        {
          provide: PersonalityTraitsService,
          useValue: {
            getAllTraits: () => Promise.resolve([]),
          },
        },
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: UserPersistenceService,
          useValue: {
            validateUser: () => Promise.resolve(true),
            ensureUsersExist: () => Promise.resolve(),
          },
        },
        {
          provide: PetSeedService,
          useValue: {
            ensureSeed: () => Promise.resolve(),
          },
        },
      ],
    }).compile();

    controller = module.get<PetsController>(PetsController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });
});
