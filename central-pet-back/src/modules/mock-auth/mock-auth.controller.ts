import { Controller, Get, Headers } from '@nestjs/common';
import { MockAuthService } from './mock-auth.service';

@Controller('auth')
export class MockAuthController {
  constructor(private readonly mockAuthService: MockAuthService) {}

  @Get('me')
  getMe(@Headers('x-mock-user-id') mockUserId?: string) {
    return this.mockAuthService.getCurrentUser(mockUserId);
  }

  @Get('mock-users')
  listMockUsers() {
    return this.mockAuthService.listUsers();
  }
}
