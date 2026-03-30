import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { PetsModule } from './modules/pets/pets.module';
import { PetHistoryModule } from './modules/pet-history/pet-history.module';
import { AdoptionRequestsModule } from './modules/adoption-requests/adoption-requests.module';
import { PersonalityTraitsModule } from './modules/personality-traits/personality-traits.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    HealthModule,
    PetsModule,
    PetHistoryModule,
    AdoptionRequestsModule,
    PersonalityTraitsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
