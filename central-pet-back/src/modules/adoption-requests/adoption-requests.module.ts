import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PetHistoryModule } from '../pet-history/pet-history.module';
import { PetsModule } from '../pets/pets.module';
import { AdoptionRequestsController } from './adoption-requests.controller';
import { AdoptionRequestsService } from './adoption-requests.service';

@Module({
  imports: [AuthModule, PetsModule, PetHistoryModule],
  controllers: [AdoptionRequestsController],
  providers: [AdoptionRequestsService],
})
export class AdoptionRequestsModule {}
