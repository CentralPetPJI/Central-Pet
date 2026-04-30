import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { ManageAdoptionRequestDto } from '../dto/manage-adoption-request.dto';
import type {
  AdoptionRequestRecord,
  AdoptionRequestNotification,
} from '@/modules/adoption-requests/models';
import { AdoptionRequestStatus } from '@/modules/adoption-requests/models';
import { AuditService } from '@/modules/audit/audit.service';

@Injectable()
export class ShareContactUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async execute(
    requestId: string,
    _responsibleUserId: string,
    dto: ManageAdoptionRequestDto,
  ): Promise<{
    message: string;
    updatedReq: AdoptionRequestRecord;
    notification?: AdoptionRequestNotification;
  }> {
    const currentRequest = await this.prisma.adoptionRequest.findUnique({
      where: { id: requestId },
    });

    if (!currentRequest) {
      throw new NotFoundException(`Solicitação de adoção com id "${requestId}" não encontrada`);
    }

    const updatedRequest = await this.prisma.adoptionRequest.update({
      where: {
        id: requestId,
        version: currentRequest.version,
      },
      data: {
        responsibleContactShareConsent: true,
        status: AdoptionRequestStatus.CONTACT_SHARED,
        note: dto.note?.trim() || null,
        version: { increment: 1 },
      },
    });

    if (!updatedRequest) {
      throw new NotFoundException(`Solicitação de adoção com id "${requestId}" não encontrada`);
    }

    // audit log: responsible user shared contact for adoption request
    if (this.auditService) {
      await this.auditService.createWithTx(this.prisma as any, {
        userId: _responsibleUserId,
        action: 'SHARE_ADOPTION_CONTACT',
        targetId: requestId,
        targetType: 'ADOPTION_REQUEST',
        details: { petId: updatedRequest.petId, adopterId: updatedRequest.adopterId },
      });
    }

    // TODO: Acredito que podemos modififcar para o manage criar a notificacao
    const notification = {
      id: `${requestId}-notification-contact-shared`,
      requestId,
      recipientId: updatedRequest.adopterId,
      type: 'CONTACT_SHARED' as const,
      message: `O tutor compartilhou o contato referente ao pet ${updatedRequest.petId}.`,
      createdAt: updatedRequest.updatedAt.toISOString(),
    };

    return {
      message: 'Contato compartilhado com sucesso',
      updatedReq: updatedRequest,
      notification,
    };
  }
}
