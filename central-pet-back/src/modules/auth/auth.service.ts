import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { verifyPassword } from './password.util';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    if (user.deleted) {
      throw new UnauthorizedException(
        'Esta conta foi desativada. Entre em contato com o suporte para mais informações.',
      );
    }

    const isPasswordValid = await verifyPassword(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
      },
    });

    return {
      message: 'Login bem-sucedido',
      data: {
        sessionId: session.id,
        user: user,
      },
    };
  }

  async getAuthenticatedUser(sessionId?: string | null) {
    if (!sessionId) {
      throw new UnauthorizedException('Autenticação requerida');
    }

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new UnauthorizedException('Autenticação requerida');
    }

    // TODO: Se é so para validar autenticacao, talvez seja melhor so retornar o necessario e nao o user inteiro, pra evitar expor dados desnecessarios. Mas por ora tá ok retornar o user inteiro mesmo.
    const user = await this.usersService.findById(session.userId);

    if (user.deleted) {
      throw new UnauthorizedException(
        'Esta conta foi desativada. Entre em contato com o suporte para mais informações.',
      );
    }

    if (!user) {
      throw new UnauthorizedException(
        'Usuário associado à sessão não encontrado. A sessão será encerrada.',
      );
    }

    if (user.deleted) {
      throw new UnauthorizedException(
        'Esta conta foi desativada. Entre em contato com o suporte para mais informações.',
      );
    }

    if (!user) {
      await this.prisma.session.delete({
        where: { id: sessionId },
      });
      throw new UnauthorizedException('Autenticação requerida');
    }

    return {
      message: 'Usuário autenticado',
      data: {
        user: user,
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
      message: 'Logout bem-sucedido',
    };
  }
}
