import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MockAuthController } from './mock-auth.controller';
import { MockAuthService } from './mock-auth.service';

@Module({
  imports: [AuthModule],
  controllers: [MockAuthController],
  providers: [MockAuthService],
  exports: [MockAuthService],
})
export class MockAuthModule {}
