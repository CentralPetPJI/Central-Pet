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
        throw new ConflictException('Esta solicitação não pode ser aprovada no momento.');
      }
      if (!currentRequest.responsibleContactShareConsent) {
        throw new BadRequestException(
          'O adotante deve autorizar o compartilhamento de contato antes desta etapa ser concluída',
        );
      }
      return this.approveAdoptionUseCase.execute(requestId, userId, dto);
    }

    if (dto.action === 'share_contact') {
      if (!canShareContactForStatus(currentRequest.status as unknown as AdoptionRequestStatus)) {
        throw new ConflictException(
          'Para compartilhar o contato, o status anterior deve ser "Pendente".',
        );
      }
      /* TODO: Verificar se o usuario adotante ja compartilhou o contato
if (!currentRequest.adopterContactShareConsent) {
        throw new BadRequestException(
          'O tutor deve autorizar o compartilhamento de contato antes desta etapa ser concluída',
        );
      }*/
      return this.shareContactUseCase.execute(requestId, userId, dto);
    }

    const rejectResult = await this.rejectAdoptionUseCase.execute(requestId, userId, dto);
    return {
      message: rejectResult.message,
      updatedReq: rejectResult.updatedReq,
      notification: rejectResult.notification,
      autoRejectedCount: rejectResult.autoRejectedCount,
    };
  }
}
