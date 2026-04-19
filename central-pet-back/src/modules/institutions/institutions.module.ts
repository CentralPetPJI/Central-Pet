import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { InstitutionsService } from './institutions.service';
import { InstitutionsController } from './institutions.controller';

import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [InstitutionsController],
  providers: [InstitutionsService],
  exports: [InstitutionsService],
})
export class InstitutionsModule {}
