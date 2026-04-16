import { beforeEach, describe, expect, it } from '@jest/globals';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { makePrismaMock } from '@/utils/prisma-mock';

describe('UsersService', () => {
  type CreateUserInput = {
    fullName: string;
    email: string;
    role: 'PESSOA_FISICA' | 'ONG';
    birthDate?: string | null;
    cpf?: string | null;
    organizationName?: string | null;
    cnpj?: string | null;
    passwordHash: string;
  };

  let service: UsersService;
  let prismaMock = makePrismaMock();

  beforeEach(() => {
    prismaMock = makePrismaMock();
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockImplementation(
      (args: {
        data: {
          fullName: string;
          email: string;
          role: string;
          birthDate?: string;
          cpf?: string;
          organizationName?: string;
          cnpj?: string;
          passwordHash: string;
        };
      }) => ({
        id: 'user-1',
        fullName: args.data.fullName,
        email: args.data.email,
        role: args.data.role as 'PESSOA_FISICA' | 'ONG',
        birthDate: args.data.birthDate ?? null,
        cpf: args.data.cpf ?? null,
        organizationName: args.data.organizationName ?? null,
        cnpj: args.data.cnpj ?? null,
        passwordHash: args.data.passwordHash,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    );

    service = new UsersService(prismaMock as unknown as PrismaService);
  });

  const makeAdopterDto = (): CreateUserDto => ({
    fullName: 'Maria Silva',
    email: 'maria@example.com',
    password: 'Senha123!',
    role: 'PESSOA_FISICA',
    cpf: '12345678901',
  });

  it('deve criar um usuário adotante', async () => {
    const result = await service.create(makeAdopterDto());

    expect(result.message).toBe('User created successfully');
    expect(result.data.id).toBeDefined();
    expect(result.data.email).toBe('maria@example.com');
    expect(result.data.role).toBe('PESSOA_FISICA');
    expect(result.data.cpf).toBe('12345678901');
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
    };

    await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
  });

  it('deve exigir cnpj para contas de ong', async () => {
    const invalidDto: CreateUserDto = {
      fullName: 'Casa de Apoio',
      email: 'ong@example.com',
      password: 'Senha123!',
      role: 'ONG',
    };

    await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
  });
});
