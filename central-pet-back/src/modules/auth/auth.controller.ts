import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { Cookies } from '@/decorators/cookies.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CookieInterceptor } from '@/interceptors/cookie.interceptor';
import { SetAuthModeDto } from './dto/set-auth-mode.dto';
import {
  buildSessionCookieValue,
  isMockAuthEnabled,
  parseSessionCookieValue,
  SESSION_COOKIE_NAME,
} from '@/utils/session-cookie';
import { Throttle } from '@nestjs/throttler';
import {
  Resolvable,
  ThrottlerGenerateKeyFunction,
  ThrottlerGetTrackerFunction,
} from '@nestjs/throttler/dist/throttler-module-options.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({
    default: {
      limit: 5,
      ttl: 60,
    },
  })
  @Post('login')
  @UseInterceptors(CookieInterceptor)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);

    return {
      message: result.message,
      data: {
        user: result.data.user,
        sessionId: buildSessionCookieValue('session', result.data.sessionId),
      },
    };
  }

  @Post('mode')
  @UseInterceptors(CookieInterceptor)
  setMode(@Body() dto: SetAuthModeDto) {
    // Two-step authentication flow:
    // 1. setMode sets the auth mode (mock or session) with 'pending' state via session cookie
    //    - For 'mock' mode: next step is POST /api/mock-auth/select-user with userId
    //    - For 'session' mode: next step is POST /api/auth/login with email/password
    // 2. The second-step endpoint (select-user or login) will update the session cookie
    //    with the authenticated state (mode:userId or mode:sessionId)
    // Using 'pending' state prevents premature authentication while mode is being selected.
    if (dto.mode === 'mock' && !isMockAuthEnabled()) {
      throw new UnauthorizedException('Mock auth is not available');
    }

    return {
      message: 'Auth mode selected successfully',
      data: {
        sessionId: buildSessionCookieValue(dto.mode, 'pending'),
      },
    };
  }

  @Get('me')
  me(@Cookies(SESSION_COOKIE_NAME) sessionCookie?: string) {
    const parsedSession = parseSessionCookieValue(sessionCookie);

    if (!parsedSession || parsedSession.mode !== 'session') {
      throw new UnauthorizedException('Authentication required');
    }

    return this.authService.getAuthenticatedUser(parsedSession.value);
  }

  @Post('logout')
  @UseInterceptors(CookieInterceptor)
  async logout(@Cookies(SESSION_COOKIE_NAME) sessionCookie?: string) {
    const parsedSession = parseSessionCookieValue(sessionCookie);
    const sessionId = parsedSession?.mode === 'session' ? parsedSession.value : undefined;
    const result = await this.authService.logout(sessionId);

    return {
      ...result,
      __clearSessionCookie: true,
    };
  }
}
