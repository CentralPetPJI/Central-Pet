import { Module } from '@nestjs/common';
import { PetHistoryController } from './pet-history.controller';
import { PetHistoryService } from './pet-history.service';

@Module({
  controllers: [PetHistoryController],
  providers: [PetHistoryService],
})
export class PetHistoryModule {}
