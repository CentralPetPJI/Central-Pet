import { beforeEach, describe, expect, it } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let usersService: UsersService;
  let authService: AuthService;

  beforeEach(() => {
    usersService = new UsersService();
    authService = new AuthService(usersService);
  });

  it('deve autenticar um usuário existente', async () => {
    await usersService.create({
      fullName: 'Maria Silva',
      email: 'maria@example.com',
      password: 'Senha123!',
      role: 'ADOTANTE',
      birthDate: '1995-05-10',
      cpf: '12345678901',
    });

    const result = await authService.login({
      email: 'maria@example.com',
      password: 'Senha123!',
    });

    expect(result.message).toBe('Login successful');
    expect(result.data.sessionId).toBeDefined();
    expect(result.data.user.email).toBe('maria@example.com');
  });

  it('deve rejeitar credenciais inválidas', async () => {
    await usersService.create({
      fullName: 'Maria Silva',
      email: 'maria@example.com',
      password: 'Senha123!',
      role: 'ADOTANTE',
      birthDate: '1995-05-10',
      cpf: '12345678901',
    });

    await expect(
      authService.login({
        email: 'maria@example.com',
        password: 'outraSenha',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('deve retornar usuário autenticado de uma sessão válida', async () => {
    await usersService.create({
      fullName: 'Maria Silva',
      email: 'maria@example.com',
      password: 'Senha123!',
      role: 'ADOTANTE',
      birthDate: '1995-05-10',
      cpf: '12345678901',
    });

    const loginResult = await authService.login({
      email: 'maria@example.com',
      password: 'Senha123!',
    });

    const meResult = authService.getAuthenticatedUser(
      loginResult.data.sessionId,
    );

    expect(meResult.data.user.email).toBe('maria@example.com');
  });
});
