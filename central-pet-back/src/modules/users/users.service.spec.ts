import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';

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
  let prismaMock: {
    user: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(() => {
    prismaMock = {
      user: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(({ data }: { data: CreateUserInput }) => ({
          id: 'user-1',
          fullName: data.fullName,
          email: data.email,
          role: data.role,
          birthDate: data.birthDate ?? null,
          cpf: data.cpf ?? null,
          organizationName: data.organizationName ?? null,
          cnpj: data.cnpj ?? null,
          passwordHash: data.passwordHash,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        })),
      },
    };

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
    prismaMock.user.findFirst.mockResolvedValueOnce({ id: 'existing' });

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
