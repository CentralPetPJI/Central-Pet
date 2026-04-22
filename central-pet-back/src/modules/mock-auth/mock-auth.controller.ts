import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Cookies } from '@/decorators/cookies.decorator';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { CookieInterceptor } from '@/interceptors/cookie.interceptor';
import {
  buildSessionCookieValue,
  isMockAuthEnabled,
  parseSessionCookieValue,
  SESSION_COOKIE_NAME,
} from '@/utils/session-cookie';
import type { MockUser } from '@/mocks';
import type { PublicUser } from '@/modules/users/users.service';
import { MockAuthService } from './mock-auth.service';
import { SelectMockUserDto } from './dto/select-mock-user.dto';
import { SessionGuard } from '@/modules/auth/guards/session.guard';
import { NotProductionGuard } from '@/modules/mock-auth/guards/not-production.guard';

@UseGuards(NotProductionGuard)
@Controller('mock-auth')
export class MockAuthController {
  constructor(private readonly mockAuthService: MockAuthService) {}

  @Get('me')
  @UseGuards(SessionGuard)
  getMe(
    @CurrentUser() user: MockUser | PublicUser,
    @Cookies(SESSION_COOKIE_NAME) sessionCookie?: string,
  ) {
    const parsedSession = parseSessionCookieValue(sessionCookie);

    if (!parsedSession || parsedSession.mode !== 'mock') {
      throw new UnauthorizedException('Authentication required');
    }

    return {
      message: 'Authenticated user retrieved successfully',
      data: {
        user,
      },
    };
  }

  @Get('mock-users')
  listMockUsers() {
    if (!isMockAuthEnabled()) {
      throw new UnauthorizedException('Mock auth is not available');
    }
    return this.mockAuthService.listUsers();
  }

  @Post('select-user')
  @UseInterceptors(CookieInterceptor)
  selectUser(@Body() dto: SelectMockUserDto) {
    if (!isMockAuthEnabled()) {
      throw new UnauthorizedException('Mock auth is not available');
    }

    const result = this.mockAuthService.getCurrentUser(dto.userId);

    return {
      ...result,
      data: {
        ...result.data,
        sessionId: buildSessionCookieValue('mock', dto.userId),
      },
    };
  }

  @UseGuards(SessionGuard)
  @Post('accept-terms')
  acceptTerms(@CurrentUser() user: MockUser) {
    return this.mockAuthService.acceptTerms(user.id);
  }
}
