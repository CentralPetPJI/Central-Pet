import { Controller, Get, Headers } from '@nestjs/common';
import { MockAuthService } from './mock-auth.service';

@Controller('auth')
export class MockAuthController {
  constructor(private readonly mockAuthService: MockAuthService) {}

  @Get('me')
  getMe(@Headers('x-user-id') userId?: string) {
    return this.mockAuthService.getCurrentUser(userId);
  }

  @Get('mock-users')
  listMockUsers() {
    return this.mockAuthService.listUsers();
  }
}
