import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { PersonalityTraitsModule } from '../personality-traits/personality-traits.module';

import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [PrismaModule, PersonalityTraitsModule, UsersModule],
  controllers: [PetsController],
  providers: [PetsService],
  exports: [PetsService],
})
export class PetsModule {}
