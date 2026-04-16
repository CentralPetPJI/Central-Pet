import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { ManageAdoptionRequestDto } from '../dto/manage-adoption-request.dto';
import type {
  AdoptionRequestRecord,
  AdoptionRequestNotification,
} from '@/modules/adoption-requests/models';
import { AdoptionRequestStatus } from '@/modules/adoption-requests/models';

@Injectable()
export class ShareContactUseCase {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mark request as contact_shared. Uses only IDs; does not perform response mapping.
   */
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

    const { count: updatedCount } = await this.prisma.adoptionRequest.updateMany({
      where: {
        id: requestId,
        version: currentRequest.version,
      },
      data: {
        status: AdoptionRequestStatus.CONTACT_SHARED,
        note: dto.note?.trim() || null,
        version: { increment: 1 },
      },
    });

    if (updatedCount === 0) {
      throw new ConflictException(
        'Esta solicitação de adoção foi modificada por outro processo. Por favor, recarregue e tente novamente.',
      );
    }

    const updatedRequest = await this.prisma.adoptionRequest.findUnique({
      where: { id: requestId },
    });

    if (!updatedRequest) {
      throw new NotFoundException(`Solicitação de adoção com id "${requestId}" não encontrada`);
    }

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
