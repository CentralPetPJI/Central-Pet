import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { PersonalityTraitsModule } from '../personality-traits/personality-traits.module';

import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { UsersModule } from '@/modules/users/users.module';
import { PetOwnerGuard } from './guards/pet-owner.guard';
import { PetSeedService } from './pet-seed.service';

@Module({
  imports: [PrismaModule, PersonalityTraitsModule, UsersModule],
  controllers: [PetsController],
  providers: [PetsService, PetOwnerGuard, PetSeedService],
  exports: [PetsService],
})
export class PetsModule {}
