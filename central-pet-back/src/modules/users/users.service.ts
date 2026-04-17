import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPassword } from '../auth/password.util';
import { PrismaService } from '@/prisma/prisma.service';

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
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toPublicUser(user);
  }

  async findProfileById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        birthDate: true,
        cpf: true,
        organizationName: true,
        cnpj: true,
        city: true,
        state: true,
        createdAt: true,
        _count: {
          select: {
            responsiblePets: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Usuario encontrado com sucesso',
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        birthDate: user.birthDate,
        cpf: user.cpf,
        organizationName: user.organizationName,
        cnpj: user.cnpj,
        city: user.city,
        state: user.state,
        createdAt: user.createdAt.toISOString(),
        petsCount: user._count.responsiblePets,
      },
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...(updateUserDto.fullName && { fullName: updateUserDto.fullName.trim() }),
        ...(updateUserDto.birthDate && { birthDate: updateUserDto.birthDate }),
        ...(updateUserDto.city !== undefined && { city: updateUserDto.city ?? null }),
        ...(updateUserDto.state !== undefined && { state: updateUserDto.state ?? null }),
        ...(updateUserDto.organizationName && {
          organizationName: updateUserDto.organizationName.trim(),
        }),
      },
    });

    return {
      message: 'User updated successfully',
      data: this.toPublicUser(updatedUser),
    };
  }

  async delete(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.$transaction([
      this.prisma.pet.deleteMany({ where: { responsibleUserId: id } }),
      this.prisma.adoptionRequest.deleteMany({
        where: {
          OR: [{ responsibleUserId: id }, { adopterId: id }],
        },
      }),
      this.prisma.session.deleteMany({ where: { userId: id } }),
      this.prisma.user.delete({ where: { id } }),
    ]);

    return { message: 'User and all related data deleted successfully' };
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
