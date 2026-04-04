import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { hashPassword } from '../auth/password.util';
import { PrismaService } from '../../prisma/prisma.service';

type UserRecord = Awaited<ReturnType<PrismaService['user']['findUnique']>>;
type PersistedUser = NonNullable<UserRecord>;

export type PublicUser = Omit<PersistedUser, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    this.validateCreateInput(createUserDto);

    const normalizedEmail = createUserDto.email.trim().toLowerCase();
    const normalizedCpf = createUserDto.cpf?.trim().toUpperCase();
    const normalizedCnpj = createUserDto.cnpj?.trim().toUpperCase();
    const passwordHash = await hashPassword(createUserDto.password);
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          ...(normalizedCpf ? [{ cpf: normalizedCpf }] : []),
          ...(normalizedCnpj ? [{ cnpj: normalizedCnpj }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        fullName: createUserDto.fullName.trim(),
        email: normalizedEmail,
        role: createUserDto.role,
        birthDate: createUserDto.birthDate,
        cpf: normalizedCpf,
        organizationName: createUserDto.organizationName?.trim(),
        cnpj: normalizedCnpj,
        passwordHash,
      },
    });

    return {
      message: 'User created successfully',
      data: this.toPublicUser(user),
    };
  }

  async findByEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    return this.prisma.user.findUnique({ where: { email: normalizedEmail } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  toPublicUser(user: PersistedUser): PublicUser {
    const { passwordHash: _passwordHash, ...publicUser } = user;

    return {
      ...publicUser,
    };
  }

  private validateCreateInput(createUserDto: CreateUserDto) {
    if (createUserDto.role === 'PESSOA_FISICA' && !createUserDto.cpf) {
      throw new BadRequestException('cpf is required for person accounts');
    }

    if (createUserDto.role === 'ONG' && !createUserDto.cnpj) {
      throw new BadRequestException('cnpj is required for ONG accounts');
    }
  }
}
