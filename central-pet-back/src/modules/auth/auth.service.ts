import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { verifyPassword } from './password.util';

type SessionRecord = {
  id: string;
  userId: string;
  createdAt: string;
};

@Injectable()
export class AuthService {
  private readonly sessions = new Map<string, SessionRecord>();

  constructor(private readonly usersService: UsersService) {}

  async login(loginDto: LoginDto) {
    const user = this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await verifyPassword(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const sessionId = randomUUID();
    this.sessions.set(sessionId, {
      id: sessionId,
      userId: user.id,
      createdAt: new Date().toISOString(),
    });

    return {
      message: 'Login successful',
      data: {
        sessionId,
        user: this.usersService.toPublicUser(user),
      },
    };
  }

  getAuthenticatedUser(sessionId?: string | null) {
    if (!sessionId) {
      throw new UnauthorizedException('Authentication required');
    }

    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new UnauthorizedException('Authentication required');
    }

    const user = this.usersService.findById(session.userId);

    if (!user) {
      this.sessions.delete(sessionId);
      throw new UnauthorizedException('Authentication required');
    }

    return {
      message: 'Authenticated user retrieved successfully',
      data: {
        user: this.usersService.toPublicUser(user),
      },
    };
  }

  logout(sessionId?: string | null) {
    if (sessionId) {
      this.sessions.delete(sessionId);
    }

    return {
      message: 'Logout successful',
    };
  }
}
