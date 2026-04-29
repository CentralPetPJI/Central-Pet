import { beforeEach, describe, expect, it } from '@jest/globals';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { PrismaService } from '@/prisma/prisma.service';
import { makePrismaMock } from '@/utils/prisma-mock';
import { UserPersistenceService } from '@/modules/users/user-persistence.service';
import { hashPassword, verifyPassword } from '../auth/password.util';

jest.mock('../auth/password.util');

describe('UsersService', () => {
  let service: UsersService;
  let prismaMock = makePrismaMock();
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    prismaMock = makePrismaMock();
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.findUnique.mockResolvedValue(null);

    configService = {
      get: jest.fn().mockReturnValue('1.0.0'),
    } as unknown as jest.Mocked<ConfigService>;

    prismaMock.user.create.mockImplementation((args) => ({
      id: 'user-1',
      fullName: args.data.fullName,
      email: args.data.email,
      role: args.data.role as 'PESSOA_FISICA' | 'ONG',
      birthDate: (args.data.birthDate as Date | null) ?? null,
      cpf: (args.data.cpf as string | null) ?? null,
      organizationName: (args.data.organizationName as string | null) ?? null,
      cnpj: (args.data.cnpj as string | null) ?? null,
      city: (args.data.city as string | null) ?? null,
      state: (args.data.state as string | null) ?? null,
      passwordHash: args.data.passwordHash,
      acceptedTermsAt: args.data.acceptedTermsAt,
      acceptedTermsVersion: args.data.acceptedTermsVersion,
      mustChangePassword: (args.data.mustChangePassword as boolean | null) ?? false,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    }));

    const userPersistence = new UserPersistenceService(prismaMock as unknown as PrismaService);
    service = new UsersService(
      prismaMock as unknown as PrismaService,
      userPersistence,
      configService,
    );
  });

  const makeAdopterDto = (): CreateUserDto => ({
    fullName: 'Maria Silva',
    email: 'maria@example.com',
    password: 'Senha123!',
    role: 'PESSOA_FISICA',
    cpf: '12345678901',
    acceptTerms: true,
  });

  it('deve criar um usuário adotante', async () => {
    const result = await service.create(makeAdopterDto());

    expect(result.message).toBe('User created successfully');
    expect(result.data.id).toBeDefined();
    expect(result.data.email).toBe('maria@example.com');
    expect(result.data.role).toBe('PESSOA_FISICA');
    expect(result.data.cpf).toBe('12345678901');
  });

  it('deve persistir city e state quando informados no cadastro', async () => {
    const result = await service.create({
      ...makeAdopterDto(),
      city: 'Campinas',
      state: 'sp',
    });

    expect(result.data.city).toBe('Campinas');
    expect(result.data.state).toBe('SP');
  });

  it('deve rejeitar e-mails duplicados', async () => {
    prismaMock.user.findFirst.mockResolvedValueOnce({
      id: 'existing',
      email: 'existing@example.com',
      role: 'PESSOA_FISICA' as const,
    } as never);

    await expect(service.create(makeAdopterDto())).rejects.toThrow(ConflictException);
  });

  it('deve exigir cpf para contas de adotante', async () => {
    const invalidDto: CreateUserDto = {
      fullName: 'Maria Silva',
      email: 'maria@example.com',
      password: 'Senha123!',
      role: 'PESSOA_FISICA',
      acceptTerms: true,
    };
    delete invalidDto.cnpj;
    await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
  });

  it('deve exigir cnpj para contas de ong', async () => {
    const invalidDto: CreateUserDto = {
      fullName: 'Casa de Apoio',
      email: 'ong@example.com',
      password: 'Senha123!',
      role: 'ONG',
      acceptTerms: true,
    };
    delete invalidDto.cnpj;

    await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
  });

  describe('updatePassword', () => {
    const userId = 'user-1';
    const currentPassword = 'old-password';
    const newPassword = 'new-password-123';
    const passwordHash = 'hashed-old-password';

    beforeEach(() => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: userId,
        passwordHash,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      (verifyPassword as jest.Mock).mockReset();
      (hashPassword as jest.Mock).mockReset();
    });

    it('deve atualizar a senha com sucesso quando a senha atual estiver correta', async () => {
      (verifyPassword as jest.Mock).mockResolvedValue(true);
      (hashPassword as jest.Mock).mockResolvedValue('new-hash');

      const result = await service.updatePassword(userId, {
        currentPassword,
        newPassword,
      });

      expect(result.message).toBe('Senha atualizada com sucesso');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          passwordHash: 'new-hash',
          mustChangePassword: false,
        },
      });
    });

    it('deve falhar quando a senha atual estiver incorreta', async () => {
      (verifyPassword as jest.Mock).mockResolvedValue(false);

      await expect(
        service.updatePassword(userId, {
          currentPassword: 'wrong-password',
          newPassword,
        }),
      ).rejects.toThrow(BadRequestException);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });
});
