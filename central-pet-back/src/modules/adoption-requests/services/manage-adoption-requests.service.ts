import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { ManageAdoptionRequestDto } from '../dto/manage-adoption-request.dto';
import { ApproveAdoptionUseCase, ShareContactUseCase, RejectAdoptionUseCase } from '../use-cases';
import type {
  AdoptionRequestRecord,
  AdoptionRequestNotification,
} from '@/modules/adoption-requests/models';
import {
  AdoptionRequestStatus,
  canApproveForStatus,
  canShareContactForStatus,
} from '@/modules/adoption-requests/models';

@Injectable()
export class ManageAdoptionRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly approveAdoptionUseCase: ApproveAdoptionUseCase,
    private readonly shareContactUseCase: ShareContactUseCase,
    private readonly rejectAdoptionUseCase: RejectAdoptionUseCase,
  ) {}

  /**
   * Manage a received adoption request. Returns raw DB-level result; response assembly
   * is done by a higher layer.
   */
  async manageReceived(
    requestId: string,
    userId: string,
    dto: ManageAdoptionRequestDto,
  ): Promise<{
    message: string;
    updatedReq: AdoptionRequestRecord;
    notification?: AdoptionRequestNotification;
    autoRejectedCount?: number;
  }> {
    const currentRequest = await this.prisma.adoptionRequest.findUnique({
      where: { id: requestId },
    });

    if (!currentRequest) {
      throw new NotFoundException(`Solicitação de adoção com id "${requestId}" não encontrada`);
    }

    // only the responsible user may manage received requests
    if (currentRequest.responsibleUserId !== userId) {
      throw new BadRequestException(
        'Você não pode gerenciar solicitações de pets que você não possui',
      );
    }

    const pet = await this.prisma.pet.findUnique({ where: { id: currentRequest.petId } });
    if (!pet) {
      throw new NotFoundException(`Pet com id "${currentRequest.petId}" não encontrado`);
    }

    if (dto.action === 'approve') {
      if (!canApproveForStatus(currentRequest.status as unknown as AdoptionRequestStatus)) {
        throw new ConflictException(
          'Para aprovar uma solicitação de adoção, o status anterior deve ser "Compartilhado".',
        );
      }
      return this.approveAdoptionUseCase.execute(requestId, userId, dto);
    }

    if (dto.action === 'share_contact') {
      if (!canShareContactForStatus(currentRequest.status as unknown as AdoptionRequestStatus)) {
        throw new BadRequestException(
          'Para compartilhar o contato, o status anterior deve ser "Pendente".',
        );
      }
      if (!currentRequest.adopterContactShareConsent) {
        throw new BadRequestException(
          'O adotante deve autorizar o compartilhamento de contato antes desta etapa ser concluída',
        );
      }
      return this.shareContactUseCase.execute(requestId, userId, dto);
    }

    return this.rejectAdoptionUseCase.execute(requestId, userId, dto);
  }
}
