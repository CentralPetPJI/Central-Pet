import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { AuditService } from '@/modules/audit/audit.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPassword } from '../auth/password.util';
import { PrismaService } from '@/prisma/prisma.service';
import { UserPersistenceService } from '@/modules/users/user-persistence.service';

type UserRecord = Awaited<ReturnType<PrismaService['user']['findUnique']>>;
type PersistedUser = NonNullable<UserRecord>;

export type PublicUser = Omit<PersistedUser, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userPersistence: UserPersistenceService,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    this.validateCreateInput(createUserDto);

    const normalizedEmail = createUserDto.email.trim().toLowerCase();
    const normalizedCpf = createUserDto.cpf?.trim().toUpperCase();
    const passwordHash = await hashPassword(createUserDto.password);

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, ...(normalizedCpf ? [{ cpf: normalizedCpf }] : [])],
      },
    });

    if (existingUser) {
      throw new ConflictException('Usuário com esse email ou CPF já existe');
    }

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          fullName: createUserDto.fullName.trim(),
          email: normalizedEmail,
          role: createUserDto.role,
          birthDate: createUserDto.birthDate,
          cpf: normalizedCpf,
          passwordHash,
        },
      });

      // audit log: user creation
      if (this.auditService) {
        await this.auditService.createWithTx(tx, {
          userId: newUser.id,
          action: 'CREATE_USER',
          targetId: newUser.id,
          targetType: 'USER',
          details: { role: createUserDto.role },
        });
      }

      return newUser;
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
    await this.userPersistence.validateUser(id);
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toPublicUser(user);
  }

  async findProfileById(id: string) {
    await this.userPersistence.validateUser(id);
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
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
        phone: user.phone,
        mobile: user.mobile,
        instagram: user.instagram,
        facebook: user.facebook,
        website: user.website,
        foundedAt: user.foundedAt,
        createdAt: user.createdAt,
        petsCount: user._count?.responsiblePets ?? 0,
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
        ...(updateUserDto.fullName !== undefined && {
          fullName:
            typeof updateUserDto.fullName === 'string'
              ? updateUserDto.fullName.trim()
              : (updateUserDto.fullName ?? null),
        }),
        ...(updateUserDto.birthDate !== undefined && {
          birthDate: updateUserDto.birthDate ?? null,
        }),
        ...(updateUserDto.city !== undefined && { city: updateUserDto.city ?? null }),
        ...(updateUserDto.state !== undefined && { state: updateUserDto.state ?? null }),
        ...(updateUserDto.organizationName !== undefined && {
          organizationName: updateUserDto.organizationName.trim() ?? null,
        }),
        ...(updateUserDto.phone !== undefined && { phone: updateUserDto.phone ?? null }),
        ...(updateUserDto.mobile !== undefined && { mobile: updateUserDto.mobile ?? null }),
        ...(updateUserDto.instagram !== undefined && {
          instagram: updateUserDto.instagram ?? null,
        }),
        ...(updateUserDto.facebook !== undefined && { facebook: updateUserDto.facebook ?? null }),
        ...(updateUserDto.website !== undefined && { website: updateUserDto.website ?? null }),
        ...(updateUserDto.foundedAt !== undefined && {
          foundedAt: updateUserDto.foundedAt ?? null,
        }),
      },
    });

    // audit log: profile update (record changed fields)
    if (this.auditService) {
      await this.auditService.create({
        userId: id,
        action: 'UPDATE_PROFILE',
        targetId: id,
        targetType: 'USER',
        details: { updatedFields: Object.keys(updateUserDto) },
      });
    }

    return {
      message: 'User updated successfully',
      data: this.toPublicUser(updatedUser),
    };
  }

  async deactivate(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    /*
      Soft-deactivate user data:
      - Mark all pets as deleted + UNAVAILABLE
      - Cancel adoption requests involving the user
      - Remove sessions

      NOTE: We intentionally keep the user's email unchanged to allow the login flow to display a "conta desativada" message. Only the `deleted` flag is set on the user row to avoid breaking relations (schema uses Restrict on some FKs).
    */
    await this.prisma.$transaction([
      this.prisma.pet.updateMany({
        where: { responsibleUserId: id },
        data: { deleted: true, status: 'UNAVAILABLE' },
      }),
      this.prisma.adoptionRequest.updateMany({
        where: {
          OR: [{ responsibleUserId: id }, { adopterId: id }],
        },
        data: { status: 'CANCELLED' },
      }),
      this.prisma.session.deleteMany({ where: { userId: id } }),
      this.prisma.user.update({
        where: { id },
        data: {
          deleted: true,
        },
      }),
    ]);

    return { message: 'User deactivated successfully' };
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
