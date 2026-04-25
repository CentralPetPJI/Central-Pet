import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
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
import { AdminModule } from './modules/admin/admin.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuditInterceptor } from './interceptors/audit.interceptor';

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
    AuditModule,
    HealthModule,
    PetsModule,
    PetHistoryModule,
    AdoptionRequestsModule,
    MockAuthModule,
    UsersModule,
    AuthModule,
    PersonalityTraitsModule,
    AdminModule,
    ModerationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
