import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PetHistoryController } from './pet-history.controller';
import { PetHistoryService } from './pet-history.service';

@Module({
  imports: [PrismaModule],
  controllers: [PetHistoryController],
  providers: [PetHistoryService],
  exports: [PetHistoryService],
})
export class PetHistoryModule {}
