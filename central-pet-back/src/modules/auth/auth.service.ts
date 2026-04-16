import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { verifyPassword } from './password.util';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await verifyPassword(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
      },
    });

    return {
      message: 'Login successful',
      data: {
        sessionId: session.id,
        user: this.usersService.toPublicUser(user),
      },
    };
  }

  async getAuthenticatedUser(sessionId?: string | null) {
    if (!sessionId) {
      throw new UnauthorizedException('Authentication required');
    }

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new UnauthorizedException('Authentication required');
    }

    const user = await this.usersService.findById(session.userId);

    if (!user) {
      await this.prisma.session.delete({
        where: { id: sessionId },
      });
      throw new UnauthorizedException('Authentication required');
    }

    return {
      message: 'Authenticated user retrieved successfully',
      data: {
        user: this.usersService.toPublicUser(user),
      },
    };
  }

  async logout(sessionId?: string | null) {
    if (sessionId) {
      // TODO: acho que é soft delete, pra manter histórico de sessões e permitir auditoria, etc. Mas por ora tá ok deletar mesmo.
      await this.prisma.session.deleteMany({
        where: { id: sessionId },
      });
    }

    return {
      message: 'Logout successful',
    };
  }
}
