import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ModerationStatus } from '../../../generated/prisma/client';

import { UsersService } from '@/modules/users/users.service';
import { AdminCreateUserDto } from '@/modules/users/dto/admin-create-user.dto';
import { AuditService } from '@/modules/audit/audit.service';
import { PetsService } from '@/modules/pets/pets.service';
import { PetStatsEventsService } from '@/modules/pets/pet-stats-events.service';
import { generateRandomPassword } from '@/modules/auth/password.util';
import { ModerationTargetType } from '@/modules/moderation/moderation-target-type';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly petsService: PetsService,
    private readonly petStatsEvents: PetStatsEventsService,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async getAllUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        deleted: true,
        createdAt: true,
        cpf: true,
        cnpj: true,
      },
    });
  }

  /**
   * Create an ADMIN user — can only be called by ROOT (controller-enforced).
   * If password is not provided, generate a temporary one and return it.
   */
  async createAdmin(data: { fullName: string; email: string; password?: string }, rootId: string) {
    const passwordWasProvided = typeof data.password === 'string' && data.password.length > 0;

    // generate a cryptographically secure temporary password only when not provided
    const generatedPassword = !passwordWasProvided ? generateRandomPassword(12) : undefined;
    const passwordToUse = passwordWasProvided ? data.password! : generatedPassword!;

    const createDto = {
      fullName: data.fullName,
      email: data.email,
      password: passwordToUse,
      role: 'PESSOA_FISICA' as const,
      acceptTerms: true,
      roleOverride: 'ADMIN' as const,
      mustChangePassword: true,
    };

    const result = await this.usersService.createByAdmin(rootId, createDto as AdminCreateUserDto);

    // record audit log
    if (this.auditService) {
      await this.auditService.create({
        userId: rootId,
        action: 'CREATE_ADMIN',
        targetId: result.data.id,
        targetType: 'USER',
        details: { createdBy: rootId, email: data.email },
      });
    }

    return { message: 'Admin criado com sucesso', data: result.data };
  }

  async toggleUserStatus(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    // Proibir desativação do ROOT por administradores não-root
    if (user.role === 'ROOT' && adminId !== user.id) {
      throw new ForbiddenException('Proibido: apenas ROOT pode modificar o status do ROOT');
    }

    const shouldDeactivate = !user.deleted;

    await this.prisma.$transaction(async (tx) => {
      if (shouldDeactivate) {
        // deactivate path - run full lifecycle from UsersService inside this transaction
        await this.usersService.deactivateTransactional(tx, userId);
      } else {
        // reactivate path - restore user deleted flag (business rules kept minimal)
        await this.usersService.reactivateTransactional(tx, userId);
      }

      if (this.auditService) {
        await this.auditService.createWithTx(tx, {
          userId: adminId,
          action: shouldDeactivate ? 'DEACTIVATE_USER' : 'REACTIVATE_USER',
          targetId: userId,
          targetType: 'USER',
          details: { previousStatus: user.deleted, newStatus: shouldDeactivate },
        });
      }
    });

    this.petStatsEvents.emitChanged();

    return { message: `Usuário ${shouldDeactivate ? 'desativado' : 'reativado'} com sucesso` };
  }

  async togglePetDeletion(petId: string, adminId: string) {
    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) throw new NotFoundException('Pet não encontrado');

    if (pet.status === 'ADOPTED') {
      throw new BadRequestException(
        'Não é possível bloquear/desbloquear um pet que já foi adotado.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      if (pet.deleted) {
        await this.petsService.reactivatePetTransactional(tx, petId, adminId, {
          isAdmin: true,
          reason: 'Pet reativado por admin',
        });
      } else {
        await this.petsService.removeTransactional(tx, petId, adminId, {
          isAdmin: true,
          reason: 'Pet removido por admin',
        });
      }
    });

    this.petStatsEvents.emitChanged();

    return { message: `Pet ${pet.deleted ? 'reativado' : 'removido'} com sucesso` };
  }

  async getPets(userId?: string, page = 1, limit = 12) {
    const where = userId ? { responsibleUserId: userId } : undefined;

    const [total, pets] = await Promise.all([
      this.prisma.pet.count({ where }),
      this.prisma.pet.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          profilePhoto: true,
          deleted: true,
          status: true,
          createdAt: true,
          responsibleUserId: true,
          responsibleUser: {
            select: { fullName: true },
          },
        },
      }),
    ]);

    const mappedPets = pets.map((pet) => ({
      ...pet,
      adoptionStatus: pet.status,
    }));

    return { data: mappedPets, total, page, limit };
  }

  async getAuditLogs(userId?: string, page = 1, limit = 20) {
    const where = userId ? { userId } : undefined;

    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { fullName: true, email: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const mapped = logs.map((l) => ({
      ...l,
      admin: l.user,
    }));

    return { data: mapped, total, page, limit };
  }

  async getReports() {
    return this.prisma.moderationReport.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { fullName: true } },
        resolvedBy: { select: { fullName: true } },
      },
    });
  }

  async resolveReport(
    reportId: string,
    adminId: string,
    status: ModerationStatus,
    blockPet = false,
  ) {
    const report = await this.prisma.moderationReport.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Denúncia não encontrada');

    await this.prisma.$transaction(async (tx) => {
      // update report
      await tx.moderationReport.update({
        where: { id: reportId },
        data: { status, resolvedById: adminId },
      });

      // create audit for the report resolution (more explicit action name)
      const action =
        status === ModerationStatus.APPROVED
          ? 'APPROVE_REPORT'
          : status === ModerationStatus.REJECTED
            ? 'REJECT_REPORT'
            : 'RESOLVE_REPORT';

      if (this.auditService) {
        await this.auditService.createWithTx(tx, {
          userId: adminId,
          action,
          targetId: reportId,
          targetType: 'REPORT',
          details: { status },
        });
      }

      if (
        status === ModerationStatus.APPROVED &&
        blockPet &&
        report.targetType === ModerationTargetType.PET
      ) {
        const pet = await tx.pet.findUnique({ where: { id: report.targetId } });
        if (pet && !pet.deleted) {
          await this.petsService.removeTransactional(tx, pet.id, adminId, {
            isAdmin: true,
            reason: 'Denúncia aprovada',
            reportId,
          });
        }
      }
    });

    if (
      status === ModerationStatus.APPROVED &&
      blockPet &&
      report.targetType === ModerationTargetType.PET
    ) {
      this.petStatsEvents.emitChanged();
    }

    return { message: 'Denúncia resolvida com sucesso' };
  }
}
