import { beforeEach, describe, expect, it } from '@jest/globals';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { PrismaService } from '@/prisma/prisma.service';
import { makePrismaMock } from '@/utils/prisma-mock';
import { UserPersistenceService } from '@/modules/users/user-persistence.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaMock = makePrismaMock();

  beforeEach(() => {
    prismaMock = makePrismaMock();
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.findUnique.mockResolvedValue(null);

    // TODO: Verificar se é possível tipar melhor o args
    // TS2345: Argument of type is not assignable to parameter of type

    // @ts-expect-error prisma mock parcial para os cenarios do service
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
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    }));

    const userPersistence = new UserPersistenceService(prismaMock as unknown as PrismaService);
    service = new UsersService(prismaMock as unknown as PrismaService, userPersistence);
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
