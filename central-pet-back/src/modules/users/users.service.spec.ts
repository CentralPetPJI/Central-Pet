import { beforeEach, describe, expect, it } from '@jest/globals';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    service = new UsersService();
  });

  const makeAdopterDto = (): CreateUserDto => ({
    fullName: 'Maria Silva',
    email: 'maria@example.com',
    password: 'Senha123!',
    role: 'ADOTANTE',
    birthDate: '1995-05-10',
    cpf: '12345678901',
  });

  it('should create an adopter user', async () => {
    const result = await service.create(makeAdopterDto());

    expect(result.message).toBe('User created successfully');
    expect(result.data.id).toBeDefined();
    expect(result.data.email).toBe('maria@example.com');
    expect(result.data.role).toBe('ADOTANTE');
    expect(result.data.cpf).toBe('12345678901');
  });

  it('should reject duplicate emails', async () => {
    await service.create(makeAdopterDto());

    await expect(service.create(makeAdopterDto())).rejects.toThrow(
      ConflictException,
    );
  });

  it('should require cpf and birthDate for adopter accounts', async () => {
    const invalidDto: CreateUserDto = {
      fullName: 'Maria Silva',
      email: 'maria@example.com',
      password: 'Senha123!',
      role: 'ADOTANTE',
    };

    await expect(service.create(invalidDto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should require organizationName and cnpj for ong accounts', async () => {
    const invalidDto: CreateUserDto = {
      fullName: 'Casa de Apoio',
      email: 'ong@example.com',
      password: 'Senha123!',
      role: 'ONG',
    };

    await expect(service.create(invalidDto)).rejects.toThrow(
      BadRequestException,
    );
  });
});
