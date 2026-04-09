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
import { CookieInterceptor } from '../../interceptors/cookie.interceptor';
import { SetAuthModeDto } from './dto/set-auth-mode.dto';
import {
  buildSessionCookieValue,
  isMockAuthEnabled,
  parseSessionCookieValue,
  SESSION_COOKIE_NAME,
} from '@/utils//session-cookie';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseInterceptors(CookieInterceptor)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);

    return {
      message: result.message,
      data: {
        user: result.data.user,
        sessionId: buildSessionCookieValue('jwt', result.data.sessionId),
      },
    };
  }

  @Post('mode')
  @UseInterceptors(CookieInterceptor)
  setMode(@Body() dto: SetAuthModeDto) {
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

    if (!parsedSession || parsedSession.mode !== 'jwt') {
      throw new UnauthorizedException('Authentication required');
    }

    return this.authService.getAuthenticatedUser(parsedSession.value);
  }

  @Post('logout')
  @UseInterceptors(CookieInterceptor)
  async logout(@Cookies(SESSION_COOKIE_NAME) sessionCookie?: string) {
    const parsedSession = parseSessionCookieValue(sessionCookie);
    const jwtSessionId = parsedSession?.mode === 'jwt' ? parsedSession.value : undefined;
    const result = await this.authService.logout(jwtSessionId);

    return {
      ...result,
      __clearSessionCookie: true,
    };
  }
}
