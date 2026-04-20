import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { PetsModule } from './modules/pets/pets.module';
import { PetHistoryModule } from './modules/pet-history/pet-history.module';
import { AdoptionRequestsModule } from './modules/adoption-requests/adoption-requests.module';
import { MockAuthModule } from '@/modules/mock-auth';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PersonalityTraitsModule } from './modules/personality-traits/personality-traits.module';
import { InstitutionsModule } from './modules/institutions/institutions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV ?? 'development'}`, '.env'],
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: Number(configService.get<string>('THROTTLE_TTL')) || 60000,
          limit: Number(configService.get<string>('THROTTLE_LIMIT')) || 60,
        },
      ],
    }),
    PrismaModule,
    HealthModule,
    PetsModule,
    PetHistoryModule,
    AdoptionRequestsModule,
    MockAuthModule,
    UsersModule,
    AuthModule,
    InstitutionsModule,
    PersonalityTraitsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
