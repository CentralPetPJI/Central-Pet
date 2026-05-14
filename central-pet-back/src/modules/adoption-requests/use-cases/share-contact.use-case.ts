import { ConflictException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { ManageAdoptionRequestDto } from '../dto/manage-adoption-request.dto';
import type {
  AdoptionRequestRecord,
  AdoptionRequestNotification,
} from '@/modules/adoption-requests/models';
import { AdoptionRequestStatus } from '@/modules/adoption-requests/models';
import { AuditService } from '@/modules/audit/audit.service';
import { Prisma } from '../../../../generated/prisma/client';
import { PetsService } from '@/modules/pets/pets.service';

@Injectable()
export class ShareContactUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly petsService: PetsService,
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
    const updatedRequest = await this.prisma.$transaction(async (tx) => {
      const currentRequest = await tx.adoptionRequest.findUnique({
        where: { id: requestId },
      });

      if (!currentRequest) {
        throw new NotFoundException(`Solicitação de adoção com id "${requestId}" não encontrada`);
      }

      let updated: AdoptionRequestRecord;
      try {
        updated = await tx.adoptionRequest.update({
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
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          throw new ConflictException(
            `A solicitação de adoção "${requestId}" foi alterada por outro usuário. Por favor, recarregue a página.`,
          );
        }
        throw error;
      }

      if (this.auditService) {
        await this.auditService.createWithTx(tx, {
          userId: _responsibleUserId,
          action: 'SHARE_ADOPTION_CONTACT',
          targetId: requestId,
          targetType: 'ADOPTION_REQUEST',
          details: { petId: updated.petId, adopterId: updated.adopterId },
        });
      }

      return updated;
    });

    const pet = await this.petsService.findOne(updatedRequest.petId);

    const petName = pet.data.name || 'pet';
    const notification = {
      id: `${requestId}-notification-contact-shared`,
      requestId,
      recipientId: updatedRequest.adopterId,
      type: 'CONTACT_SHARED' as const,
      message: `O tutor compartilhou o contato referente ao pet ${petName}.`,
      createdAt: updatedRequest.updatedAt.toISOString(),
    };

    return {
      message: 'Contato compartilhado com sucesso',
      updatedReq: updatedRequest,
      notification,
    };
  }
}
