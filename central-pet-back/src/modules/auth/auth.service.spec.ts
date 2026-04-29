import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { PrismaService } from '@/prisma/prisma.service';
import { hashPassword } from './password.util';
import { makePrismaMock } from '@/utils/prisma-mock';

/* eslint-disable @typescript-eslint/unbound-method */

describe('AuthService', () => {
  let usersService: jest.Mocked<UsersService>;
  let authService: AuthService;
  let prismaMock = makePrismaMock();
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      toPublicUser: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    configService = {
      get: jest.fn().mockReturnValue('1.0.0'),
    } as unknown as jest.Mocked<ConfigService>;

    prismaMock = makePrismaMock();
    prismaMock.session.create.mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    prismaMock.session.delete.mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    prismaMock.session.deleteMany.mockResolvedValue({ count: 1 });

    authService = new AuthService(
      usersService,
      prismaMock as unknown as PrismaService,
      configService,
    );
  });

  const makePersistedUser = async (overrides = {}) => ({
    id: 'user-1',
    fullName: 'Maria Silva',
    email: 'maria@example.com',
    passwordHash: await hashPassword('Senha123!'),
    role: 'PESSOA_FISICA' as const,
    cpf: '12345678901',
    birthDate: new Date('1995-05-10'),
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
    acceptedTermsAt: null,
    acceptedTermsVersion: null,
    mustChangePassword: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  });

  it('deve autenticar um usuário existente', async () => {
    usersService.findByEmail.mockResolvedValue(await makePersistedUser());
    usersService.toPublicUser.mockReturnValue({
      id: 'user-1',
      fullName: 'Maria Silva',
      email: 'maria@example.com',
      role: 'PESSOA_FISICA',
      cpf: '12345678901',
      birthDate: new Date('1995-05-10'),
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
    } as any);

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
    prismaMock.session.findUnique.mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    usersService.toPublicUser.mockReturnValue({
      id: 'user-1',
      fullName: 'Maria Silva',
      email: 'maria@example.com',
      role: 'PESSOA_FISICA',
      cpf: '12345678901',
      birthDate: new Date('1995-05-10'),
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
    } as any);

    const loginResult = await authService.login({
      email: 'maria@example.com',
      password: 'Senha123!',
    });

    const meResult = await authService.getAuthenticatedUser(loginResult.data.sessionId);

    expect(meResult.data.user.email).toBe('maria@example.com');
  });

  describe('acceptTerms', () => {
    it('deve permitir aceitar termos se ainda não aceitos', async () => {
      const user = await makePersistedUser({ acceptedTermsAt: null, acceptedTermsVersion: null });
      prismaMock.user.findUnique.mockResolvedValue(user as any);
      prismaMock.user.update.mockResolvedValue({
        ...user,
        acceptedTermsAt: new Date(),
        acceptedTermsVersion: '1.0.0',
      } as any);

      const result = await authService.acceptTerms('user-1');

      expect(result.message).toBe('Termos aceitos com sucesso');
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: {
            acceptedTermsAt: expect.any(Date),
            acceptedTermsVersion: '1.0.0',
          },
        }),
      );
    });

    it('deve permitir aceitar nova versão dos termos', async () => {
      const user = await makePersistedUser({
        acceptedTermsAt: new Date('2026-01-01'),
        acceptedTermsVersion: '0.9.0',
      });
      prismaMock.user.findUnique.mockResolvedValue(user as any);
      prismaMock.user.update.mockResolvedValue({
        ...user,
        acceptedTermsAt: new Date(),
        acceptedTermsVersion: '1.0.0',
      } as any);

      const result = await authService.acceptTerms('user-1');

      expect(result.message).toBe('Termos aceitos com sucesso');
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: {
            acceptedTermsAt: expect.any(Date),
            acceptedTermsVersion: '1.0.0',
          },
        }),
      );
    });

    it('deve lançar NotFoundException se o usuário não existir', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(async () => authService.acceptTerms('user-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar BadRequestException se a mesma versão já foi aceita', async () => {
      const user = await makePersistedUser({
        acceptedTermsAt: new Date(),
        acceptedTermsVersion: '1.0.0',
      });
      prismaMock.user.findUnique.mockResolvedValue(user as any);

      await expect(async () => authService.acceptTerms('user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
