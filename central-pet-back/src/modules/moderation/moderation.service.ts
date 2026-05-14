import {
  Injectable,
  Optional,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { AuditService } from '@/modules/audit/audit.service';
import { Prisma } from '../../../generated/prisma/client';
import { ModerationTargetType } from './moderation-target-type';
import { PetsService } from '@/modules/pets/pets.service';

@Injectable()
export class ModerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly petsService: PetsService,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async createReport(reporterId: string, dto: CreateReportDto) {
    let targetId = dto.targetId;

    if (dto.targetType === ModerationTargetType.PET) {
      const internalId = await this.petsService.resolveInternalId(dto.targetId);
      if (!internalId) {
        throw new NotFoundException('Pet não encontrado');
      }
      targetId = internalId;

      const pet = await this.prisma.pet.findUnique({
        where: { id: targetId },
      });

      if (!pet) {
        throw new NotFoundException('Pet não encontrado');
      }

      if (pet.responsibleUserId === reporterId) {
        throw new ForbiddenException('Você não pode denunciar seu próprio pet');
      }
    } else if (dto.targetType === ModerationTargetType.USER) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.targetId },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      if (user.id === reporterId) {
        throw new ForbiddenException('Você não pode denunciar seu próprio usuário');
      }
    } else if (dto.targetType === ModerationTargetType.ADOPTION_REQUEST) {
      const adoptionRequest = await this.prisma.adoptionRequest.findUnique({
        where: { id: dto.targetId },
      });

      if (!adoptionRequest) {
        throw new NotFoundException('Solicitação de adoção não encontrada');
      }

      if (adoptionRequest.adopterId === reporterId) {
        throw new ForbiddenException('Você não pode denunciar sua própria solicitação de adoção');
      }

      if (adoptionRequest.responsibleUserId === reporterId) {
        throw new ForbiddenException('Você não pode denunciar sua própria solicitação de adoção');
      }
    } else {
      throw new BadRequestException('Tipo de alvo de denúncia inválido');
    }

    return this.prisma.$transaction(async (tx) => {
      try {
        const report = await tx.moderationReport.create({
          data: {
            reporterId,
            targetType: dto.targetType,
            targetId: targetId,
            reason: dto.reason,
          },
        });
        if (this.auditService) {
          await this.auditService.createWithTx(tx, {
            userId: reporterId,
            action: 'CREATE_REPORT',
            targetId: targetId,
            targetType: dto.targetType,
            details: { reason: dto.reason, reportId: report.id },
          });
        }

        return report;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new ConflictException('Você já denunciou este conteúdo');
        }
        throw error;
      }
    });
  }
}
