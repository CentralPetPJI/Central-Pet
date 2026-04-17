import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { ManageAdoptionRequestDto } from '../dto/manage-adoption-request.dto';
import type {
  AdoptionRequestRecord,
  AdoptionRequestNotification,
} from '@/modules/adoption-requests/models';
import { AdoptionRequestStatus } from '@/modules/adoption-requests/models';

@Injectable()
export class RejectAdoptionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    requestId: string,
    _responsibleUserId: string,
    dto: ManageAdoptionRequestDto,
  ): Promise<{
    message: string;
    updatedReq: AdoptionRequestRecord;
    notification?: AdoptionRequestNotification;
    autoRejectedCount: number;
  }> {
    const currentRequest = await this.prisma.adoptionRequest.findUnique({
      where: { id: requestId },
    });

    if (!currentRequest) {
      throw new NotFoundException(`Solicitação de adoção com id "${requestId}" não encontrada`);
    }

    const transactionResult = await this.prisma.$transaction(async (tx) => {
      const { count: updatedCount } = await tx.adoptionRequest.updateMany({
        where: { id: requestId, version: currentRequest.version },
        data: {
          status: AdoptionRequestStatus.REJECTED,
          note: dto.note?.trim() || null,
          version: { increment: 1 },
        },
      });

      if (updatedCount === 0) {
        throw new ConflictException(
          'Esta solicitação de adoção foi modificada por outro processo. Por favor, recarregue e tente novamente.',
        );
      }

      const { count: autoRejectedCount } = await tx.adoptionRequest.updateMany({
        where: {
          petId: currentRequest.petId,
          id: { not: requestId },
          status: AdoptionRequestStatus.PENDING,
        },
        data: {
          status: AdoptionRequestStatus.REJECTED,
          note: 'Solicitação encerrada automaticamente porque outra solicitação foi recusada.',
          version: { increment: 1 },
        },
      });

      const updatedRequest = await tx.adoptionRequest.findUnique({
        where: { id: requestId },
      });

      if (!updatedRequest) {
        throw new NotFoundException(`Solicitação de adoção com id "${requestId}" não encontrada`);
      }

      return { updatedRequest, autoRejectedCount };
    });

    const notification = {
      id: `${requestId}-notification-rejected`,
      requestId,
      recipientId: transactionResult.updatedRequest.adopterId,
      type: 'REJECTED' as const,
      message: `Sua solicitação para o pet ${transactionResult.updatedRequest.petId} foi recusada.`,
      createdAt: transactionResult.updatedRequest.updatedAt.toISOString(),
    };

    return {
      message:
        transactionResult.autoRejectedCount > 0
          ? `Solicitação de adoção recusada com sucesso. ${transactionResult.autoRejectedCount} solicitação(ões) pendente(s) foram encerradas automaticamente.`
          : 'Solicitação de adoção recusada com sucesso',
      updatedReq: transactionResult.updatedRequest,
      notification,
      autoRejectedCount: transactionResult.autoRejectedCount,
    };
  }
}
