import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PetHistoryModule } from '../pet-history/pet-history.module';
import { PetsModule } from '../pets/pets.module';
import { UsersModule } from '../users/users.module';
import { AdoptionRequestsController } from './adoption-requests.controller';
import { AdoptionRequestsService } from './adoption-requests.service';
import { ApproveAdoptionUseCase, ShareContactUseCase, RejectAdoptionUseCase } from './use-cases';
import { AdoptionRequestSimulationService, ManageAdoptionRequestsService } from './services';

@Module({
  imports: [AuthModule, PetsModule, PetHistoryModule, UsersModule],
  controllers: [AdoptionRequestsController],
  providers: [
    AdoptionRequestsService,
    ManageAdoptionRequestsService,
    ApproveAdoptionUseCase,
    ShareContactUseCase,
    RejectAdoptionUseCase,
    AdoptionRequestSimulationService,
  ],
})
export class AdoptionRequestsModule {}
