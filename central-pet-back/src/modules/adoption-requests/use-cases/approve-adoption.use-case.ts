import { BadRequestException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PetsService } from '../../pets/pets.service';
import type { ManageAdoptionRequestDto } from '../dto/manage-adoption-request.dto';
import type { AdoptionRequestRecord } from '@/modules/adoption-requests/models';
import { AdoptionRequestStatus } from '@/modules/adoption-requests/models';
import { AuditService } from '@/modules/audit/audit.service';

@Injectable()
export class ApproveAdoptionUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly petsService: PetsService,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async execute(
    requestId: string,
    responsibleUserId: string,
    dto: ManageAdoptionRequestDto,
  ): Promise<{ message: string; updatedReq: AdoptionRequestRecord; autoRejectedCount: number }> {
    const currentRequest = await this.prisma.adoptionRequest.findUnique({
      where: { id: requestId },
    });

    if (!currentRequest) {
      throw new NotFoundException(`Solicitação de adoção com id "${requestId}" não encontrada`);
    }

    const pet = await this.petsService.findByIdForAdoption(currentRequest.petId);

    if (!pet) {
      throw new NotFoundException(`Pet with id "${currentRequest.petId}" not found`);
    }

    if (pet.responsibleUserId !== currentRequest.responsibleUserId) {
      throw new BadRequestException(
        'O usuário responsável fornecido não corresponde ao dono do pet',
      );
    }

    if (pet.adoptionStatus === 'ADOPTED') {
      throw new BadRequestException(
        'Este pet já foi adotado e não pode receber novas solicitações de adoção.',
      );
    }

    const transactionResult = await this.prisma.$transaction(async (tx) => {
      const updatedReq: AdoptionRequestRecord = await tx.adoptionRequest.update({
        where: {
          id: requestId,
          status: AdoptionRequestStatus.CONTACT_SHARED,
          version: currentRequest.version,
        },
        data: {
          status: AdoptionRequestStatus.APPROVED,
          note: dto.note?.trim() || null,
          version: { increment: 1 },
        },
      });

      const { count: autoRejectedCount } = await tx.adoptionRequest.updateMany({
        where: {
          petId: updatedReq.petId,
          id: { not: updatedReq.id },
          status: { in: [AdoptionRequestStatus.PENDING, AdoptionRequestStatus.CONTACT_SHARED] },
        },
        data: {
          status: AdoptionRequestStatus.REJECTED,
          note: 'Solicitação encerrada automaticamente porque este pet já foi adotado.',
          version: { increment: 1 },
        },
      });

      const _updatedPet = await tx.pet.update({
        where: {
          id: updatedReq.petId,
          status: { in: ['AVAILABLE', 'PENDING_ADOPTION'] },
          responsibleUserId: currentRequest.responsibleUserId,
        },
        data: { responsibleUserId: updatedReq.adopterId, status: 'ADOPTED' },
      });

      await tx.petHistory.create({
        data: {
          petId: updatedReq.petId,
          eventType: 'ADOPTION_APPROVED',
          description: 'Adoção concluída e responsabilidade transferida para o adotante.',
          fromResponsible: currentRequest.responsibleUserId,
          toResponsible: updatedReq.adopterId,
          performedByUserId: responsibleUserId,
        },
      });

      // audit log: adoption approved
      if (this.auditService) {
        await this.auditService.createWithTx(tx, {
          userId: responsibleUserId,
          action: 'APPROVE_ADOPTION_REQUEST',
          targetId: updatedReq.id,
          targetType: 'ADOPTION_REQUEST',
          details: { petId: updatedReq.petId, adopterId: updatedReq.adopterId },
        });

        // audit log: pet responsibility transferred
        await this.auditService.createWithTx(tx, {
          userId: responsibleUserId,
          action: 'TRANSFER_PET',
          targetId: updatedReq.petId,
          targetType: 'PET',
          details: { from: currentRequest.responsibleUserId, to: updatedReq.adopterId },
        });
      }

      return { updatedReq, autoRejectedCount };
    });

    return {
      message:
        transactionResult.autoRejectedCount > 0
          ? `Solicitação de adoção aprovada com sucesso. ${transactionResult.autoRejectedCount} solicitação(ões) pendente(s) foram recusadas automaticamente porque o pet já foi adotado.`
          : 'Solicitação de adoção aprovada com sucesso',
      updatedReq: transactionResult.updatedReq,
      autoRejectedCount: transactionResult.autoRejectedCount,
    };
  }
}
