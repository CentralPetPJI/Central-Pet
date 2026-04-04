import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { hashPassword } from '../auth/password.util';

type UserRole = 'PESSOA_FISICA' | 'ONG';

type UserRecord = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  birthDate?: string;
  cpf?: string;
  organizationName?: string;
  cnpj?: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicUser = Omit<UserRecord, 'passwordHash'>;

@Injectable()
export class UsersService {
  private readonly users: UserRecord[] = [];

  async create(createUserDto: CreateUserDto) {
    this.validateCreateInput(createUserDto);

    const normalizedEmail = createUserDto.email.trim().toLowerCase();
    const now = new Date().toISOString();

    if (this.users.some((user) => user.email === normalizedEmail)) {
      throw new ConflictException('User with this email already exists');
    }

    const user: UserRecord = {
      id: randomUUID(),
      fullName: createUserDto.fullName.trim(),
      email: normalizedEmail,
      role: createUserDto.role,
      birthDate: createUserDto.birthDate,
      cpf: createUserDto.cpf,
      organizationName: createUserDto.organizationName?.trim(),
      cnpj: createUserDto.cnpj,
      passwordHash: await hashPassword(createUserDto.password),
      createdAt: now,
      updatedAt: now,
    };

    this.users.push(user);

    return {
      message: 'User created successfully',
      data: this.toPublicUser(user),
    };
  }

  findByEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    return this.users.find((user) => user.email === normalizedEmail);
  }

  findById(id: string) {
    return this.users.find((user) => user.id === id);
  }

  toPublicUser(user: UserRecord): PublicUser {
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }

  private validateCreateInput(createUserDto: CreateUserDto) {
    if (createUserDto.role === 'PESSOA_FISICA') {
      if (!createUserDto.cpf) {
        throw new BadRequestException('cpf is required for person accounts');
      }
    }

    if (createUserDto.role === 'ONG') {
      if (!createUserDto.cnpj) {
        throw new BadRequestException('cnpj is required for ONG accounts');
      }
    }
  }
}
