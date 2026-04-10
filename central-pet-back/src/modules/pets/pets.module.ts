import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { PersonalityTraitsModule } from '../personality-traits/personality-traits.module';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';

@Module({
  imports: [PrismaModule, PersonalityTraitsModule],
  controllers: [PetsController],
  providers: [PetsService],
  exports: [PetsService],
})
export class PetsModule {}
