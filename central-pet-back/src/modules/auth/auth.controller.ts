import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { Cookies } from '../../commons/cookies.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CookieInterceptor } from '../../interceptors/cookie.interceptor';

const SESSION_COOKIE_NAME = 'central_pet_session';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseInterceptors(CookieInterceptor) // ← magia aqui
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);

    // O interceptor vai ler isso e setar o cookie automaticamente
    return {
      message: result.message,
      data: {
        user: result.data.user,
        sessionId: result.data.sessionId, // interceptor pega isso
      },
    };
  }

  @Get('me')
  me(@Cookies(SESSION_COOKIE_NAME) sessionId?: string) {
    return this.authService.getAuthenticatedUser(sessionId);
  }

  @Post('logout')
  @UseInterceptors(CookieInterceptor)
  async logout(@Cookies(SESSION_COOKIE_NAME) sessionId?: string) {
    const result = await this.authService.logout(sessionId);

    // Para logout, podemos passar uma flag ou usar um valor especial
    return {
      ...result,
      __clearSessionCookie: true, // sinal pro interceptor
    };
  }
}
