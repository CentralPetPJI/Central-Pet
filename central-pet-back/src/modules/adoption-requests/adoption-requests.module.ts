import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdoptionRequestsController } from './adoption-requests.controller';
import { AdoptionRequestsService } from './adoption-requests.service';

@Module({
  imports: [AuthModule],
  controllers: [AdoptionRequestsController],
  providers: [AdoptionRequestsService],
})
export class AdoptionRequestsModule {}
