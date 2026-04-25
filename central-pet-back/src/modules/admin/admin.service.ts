import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

import { UsersService } from '@/modules/users/users.service';
import { AuditService } from '@/modules/audit/audit.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
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
    const tempPassword =
      data.password ??
      Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);

    const createDto = {
      fullName: data.fullName,
      email: data.email,
      password: tempPassword,
      role: 'ADMIN' as const,
    };

    const result = await this.usersService.create(createDto as any);

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

    return { message: 'Admin criado com sucesso', data: { ...result.data, tempPassword } };
  }

  async toggleUserStatus(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const newStatus = !user.deleted;

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { deleted: newStatus },
      });

      if (this.auditService) {
        await this.auditService.createWithTx(tx, {
          userId: adminId,
          action: newStatus ? 'DEACTIVATE_USER' : 'REACTIVATE_USER',
          targetId: userId,
          targetType: 'USER',
          details: { previousStatus: user.deleted, newStatus },
        });
      }
    });

    return { message: `Usuário ${newStatus ? 'desativado' : 'reativado'} com sucesso` };
  }

  async togglePetDeletion(petId: string, adminId: string) {
    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) throw new NotFoundException('Pet não encontrado');

    const newStatus = !pet.deleted;

    await this.prisma.$transaction(async (tx) => {
      await tx.pet.update({
        where: { id: petId },
        data: { deleted: newStatus },
      });

      if (this.auditService) {
        await this.auditService.createWithTx(tx, {
          userId: adminId,
          action: newStatus ? 'DEACTIVATE_PET' : 'REACTIVATE_PET',
          targetId: petId,
          targetType: 'PET',
          details: { previousStatus: pet.deleted, newStatus },
        });
      }
    });

    return { message: `Pet ${newStatus ? 'bloqueado' : 'desbloqueado'} com sucesso` };
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

    return { data: pets, total, page, limit };
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

  async resolveReport(reportId: string, adminId: string, status: string, blockPet = false) {
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
        status === 'APPROVED'
          ? 'APPROVE_REPORT'
          : status === 'REJECTED'
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

      // if approved and it's a pet report and admin requested blocking, block pet and audit that
      if (status === 'APPROVED' && blockPet && report.targetType === 'PET') {
        const pet = await tx.pet.findUnique({ where: { id: report.targetId } });
        if (pet && !pet.deleted) {
          await tx.pet.update({
            where: { id: pet.id },
            data: { deleted: true, status: 'UNAVAILABLE' },
          });

          if (this.auditService) {
            await this.auditService.createWithTx(tx, {
              userId: adminId,
              action: 'DEACTIVATE_PET',
              targetId: pet.id,
              targetType: 'PET',
              details: {
                reason: 'Report approved',
                reportId,
                previousStatus: pet.status,
                newStatus: 'UNAVAILABLE',
              },
            });
          }
        }
      }
    });

    return { message: 'Denúncia resolvida com sucesso' };
  }
}
