import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { AdoptionRequestsController } from './adoption-requests.controller';
import { AdoptionRequestsService } from './adoption-requests.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdoptionRequestsController],
  providers: [AdoptionRequestsService],
  exports: [AdoptionRequestsService],
})
export class AdoptionRequestsModule {}
