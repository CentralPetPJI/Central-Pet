import {
  Injectable,
  Optional,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { AuditService } from '@/modules/audit/audit.service';
import { ModerationTargetType } from '../../../generated/prisma/client';

@Injectable()
export class ModerationService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async createReport(reporterId: string, dto: CreateReportDto) {
    if (dto.targetType === ModerationTargetType.PET) {
      const pet = await this.prisma.pet.findUnique({
        where: { id: dto.targetId },
      });

      if (!pet) {
        throw new NotFoundException('Pet não encontrado');
      }

      if (pet.responsibleUserId === reporterId) {
        throw new ForbiddenException('Você não pode denunciar seu próprio pet');
      }
    }

    const existingReport = await this.prisma.moderationReport.findUnique({
      where: {
        reporterId_targetType_targetId: {
          reporterId,
          targetType: dto.targetType,
          targetId: dto.targetId,
        },
      },
    });

    if (existingReport) {
      throw new ConflictException('Você já denunciou este conteúdo');
    }

    return this.prisma.$transaction(async (tx) => {
      const report = await tx.moderationReport.create({
        data: {
          reporterId,
          targetType: dto.targetType,
          targetId: dto.targetId,
          reason: dto.reason,
        },
      });

      if (this.auditService) {
        await this.auditService.createWithTx(tx, {
          userId: reporterId,
          action: 'CREATE_REPORT',
          targetId: dto.targetId,
          targetType: dto.targetType,
          details: { reason: dto.reason, reportId: report.id },
        });
      }

      return report;
    });
  }
}
