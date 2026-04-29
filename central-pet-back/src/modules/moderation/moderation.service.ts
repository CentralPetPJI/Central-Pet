import { Injectable, Optional } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { AuditService } from '@/modules/audit/audit.service';

@Injectable()
export class ModerationService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async createReport(reporterId: string, dto: CreateReportDto) {
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
