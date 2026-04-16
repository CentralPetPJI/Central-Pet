import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MockAuthController } from './mock-auth.controller';
import { MockAuthService } from './mock-auth.service';
import { MockUserPersistenceService } from './mock-user-persistence.service';

@Module({
  imports: [AuthModule],
  controllers: [MockAuthController],
  providers: [MockAuthService, MockUserPersistenceService],
  exports: [MockAuthService, MockUserPersistenceService],
})
export class MockAuthModule {}
