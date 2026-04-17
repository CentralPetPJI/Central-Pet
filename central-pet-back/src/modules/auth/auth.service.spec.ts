import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { PrismaService } from '@/prisma/prisma.service';
import { hashPassword } from './password.util';
import { makePrismaMock } from '@/utils/prisma-mock';

describe('AuthService', () => {
  let usersService: jest.Mocked<UsersService>;
  let authService: AuthService;
  let prismaMock = makePrismaMock();

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      toPublicUser: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    prismaMock = makePrismaMock();
    prismaMock.session.create.mockResolvedValue({ id: 'session-1' });
    prismaMock.session.delete.mockResolvedValue(undefined);
    prismaMock.session.deleteMany.mockResolvedValue({ count: 1 });

    authService = new AuthService(usersService, prismaMock as unknown as PrismaService);
  });

  const makePersistedUser = async () => ({
    id: 'user-1',
    fullName: 'Maria Silva',
    email: 'maria@example.com',
    passwordHash: await hashPassword('Senha123!'),
    role: 'PESSOA_FISICA' as const,
    cpf: '12345678901',
    birthDate: '1995-05-10',
    organizationName: null,
    cnpj: null,
    city: null,
    state: null,
    phone: null,
    mobile: null,
    instagram: null,
    facebook: null,
    website: null,
    foundedAt: null,
    deleted: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

  it('deve autenticar um usuário existente', async () => {
    usersService.findByEmail.mockResolvedValue(await makePersistedUser());
    usersService.toPublicUser.mockReturnValue({
      id: 'user-1',
      fullName: 'Maria Silva',
      email: 'maria@example.com',
      role: 'PESSOA_FISICA',
      cpf: '12345678901',
      birthDate: '1995-05-10',
      organizationName: null,
      cnpj: null,
      city: null,
      state: null,
      phone: null,
      mobile: null,
      instagram: null,
      facebook: null,
      website: null,
      foundedAt: null,
      deleted: false,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const result = await authService.login({
      email: 'maria@example.com',
      password: 'Senha123!',
    });

    expect(result.message).toBe('Login bem-sucedido');
    expect(result.data.sessionId).toBeDefined();
    expect(result.data.user.email).toBe('maria@example.com');
  });

  it('deve rejeitar credenciais inválidas', async () => {
    usersService.findByEmail.mockResolvedValue(await makePersistedUser());

    await expect(
      authService.login({
        email: 'maria@example.com',
        password: 'outraSenha',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('deve retornar usuário autenticado de uma sessão válida', async () => {
    usersService.findByEmail.mockResolvedValue(await makePersistedUser());
    usersService.findById.mockResolvedValue(await makePersistedUser());
    prismaMock.session.findUnique.mockResolvedValue({ id: 'session-1', userId: 'user-1' });
    usersService.toPublicUser.mockReturnValue({
      id: 'user-1',
      fullName: 'Maria Silva',
      email: 'maria@example.com',
      role: 'PESSOA_FISICA',
      cpf: '12345678901',
      birthDate: '1995-05-10',
      organizationName: null,
      cnpj: null,
      city: null,
      state: null,
      phone: null,
      mobile: null,
      instagram: null,
      facebook: null,
      website: null,
      foundedAt: null,
      deleted: false,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const loginResult = await authService.login({
      email: 'maria@example.com',
      password: 'Senha123!',
    });

    const meResult = await authService.getAuthenticatedUser(loginResult.data.sessionId);

    expect(meResult.data.user.email).toBe('maria@example.com');
  });
});
