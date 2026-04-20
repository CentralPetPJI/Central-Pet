import { Module } from '@nestjs/common';
import { MockAuthController } from './mock-auth.controller';
import { MockAuthService } from './mock-auth.service';

@Module({
  imports: [],
  controllers: [MockAuthController],
  providers: [MockAuthService],
  exports: [MockAuthService],
})
export class MockAuthModule {}
