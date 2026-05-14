import { Test, TestingModule } from '@nestjs/testing';
import { ModerationService } from './moderation.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { PetsService } from '@/modules/pets/pets.service';
import {
  ForbiddenException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  Pet,
  User,
  AdoptionRequest,
  Prisma,
  ModerationReport,
} from '../../../generated/prisma/client';
import { prismaMock } from '../../../singleton';
import { ModerationTargetType } from './moderation-target-type';

describe('ModerationService', () => {
  let service: ModerationService;

  const mockAuditService = {
    createWithTx: jest.fn(),
  };

  const mockPetsService = {
    resolveInternalId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModerationService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuditService, useValue: mockAuditService },
        { provide: PetsService, useValue: mockPetsService },
      ],
    }).compile();

    service = module.get<ModerationService>(ModerationService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('createReport', () => {
    const reporterId = 'user-1';

    describe('PET', () => {
      const dto = {
        targetType: ModerationTargetType.PET,
        targetId: 'pet-1',
        reason: 'Conteúdo impróprio',
      };

      it('deve lançar NotFoundException se o pet não existir (resolveInternalId retorna null)', async () => {
        mockPetsService.resolveInternalId.mockResolvedValue(null);

        await expect(service.createReport(reporterId, dto)).rejects.toThrow(NotFoundException);
      });

      it('deve lançar NotFoundException se o pet não existir no prisma', async () => {
        mockPetsService.resolveInternalId.mockResolvedValue('uuid-pet-1');
        prismaMock.pet.findUnique.mockResolvedValue(null);

        await expect(service.createReport(reporterId, dto)).rejects.toThrow(NotFoundException);
      });

      it('deve lançar ForbiddenException se o dono denunciar o próprio pet', async () => {
        mockPetsService.resolveInternalId.mockResolvedValue('uuid-pet-1');
        prismaMock.pet.findUnique.mockResolvedValue({
          id: 'uuid-pet-1',
          responsibleUserId: reporterId,
        } as Pet);

        await expect(service.createReport(reporterId, dto)).rejects.toThrow(ForbiddenException);
      });

      it('deve lançar ConflictException se a denúncia já existir', async () => {
        mockPetsService.resolveInternalId.mockResolvedValue('uuid-pet-1');
        prismaMock.pet.findUnique.mockResolvedValue({
          id: 'uuid-pet-1',
          responsibleUserId: 'other-user',
        } as Pet);
        // Simula erro de unique constraint no create
        const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '4.15.0',
        });
        prismaMock.moderationReport.create.mockRejectedValue(error);
        prismaMock.$transaction.mockImplementation(
          async (cb: (tx: typeof prismaMock) => Promise<unknown>) => cb(prismaMock),
        );

        await expect(service.createReport(reporterId, dto)).rejects.toThrow(ConflictException);
      });

      it('deve criar a denúncia e registrar no log de auditoria se for válida', async () => {
        mockPetsService.resolveInternalId.mockResolvedValue('uuid-pet-1');
        prismaMock.pet.findUnique.mockResolvedValue({
          id: 'uuid-pet-1',
          responsibleUserId: 'other-user',
        } as Pet);
        prismaMock.moderationReport.findUnique.mockResolvedValue(null);
        prismaMock.moderationReport.create.mockResolvedValue({
          id: 'report-1',
        } as ModerationReport);

        prismaMock.$transaction.mockImplementation(
          async (cb: (tx: typeof prismaMock) => Promise<unknown>) => cb(prismaMock),
        );

        const result = await service.createReport(reporterId, dto);

        expect(result).toEqual({ id: 'report-1' });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(prismaMock.moderationReport.create).toHaveBeenCalledWith({
          data: {
            reporterId,
            targetType: dto.targetType,
            targetId: 'uuid-pet-1',
            reason: dto.reason,
          },
        });
        expect(mockAuditService.createWithTx).toHaveBeenCalled();
      });
    });

    describe('USER', () => {
      const dto = {
        targetType: ModerationTargetType.USER,
        targetId: 'user-2',
        reason: 'Spam',
      };

      it('deve lançar NotFoundException se o usuário não existir', async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);

        await expect(service.createReport(reporterId, dto)).rejects.toThrow(NotFoundException);
      });

      it('deve lançar ForbiddenException se o usuário se denunciar', async () => {
        prismaMock.user.findUnique.mockResolvedValue({
          id: reporterId,
        } as User);

        const selfDto = { ...dto, targetId: reporterId };
        await expect(service.createReport(reporterId, selfDto)).rejects.toThrow(ForbiddenException);
      });
    });

    describe('ADOPTION_REQUEST', () => {
      const dto = {
        targetType: ModerationTargetType.ADOPTION_REQUEST,
        targetId: 'req-1',
        reason: 'Linguagem ofensiva',
      };

      it('deve lançar NotFoundException se a solicitação não existir', async () => {
        prismaMock.adoptionRequest.findUnique.mockResolvedValue(null);

        await expect(service.createReport(reporterId, dto)).rejects.toThrow(NotFoundException);
      });

      it('deve lançar ForbiddenException se o adotante denunciar a própria solicitação', async () => {
        prismaMock.adoptionRequest.findUnique.mockResolvedValue({
          id: 'req-1',
          adopterId: reporterId,
          responsibleUserId: 'other',
        } as AdoptionRequest);

        await expect(service.createReport(reporterId, dto)).rejects.toThrow(ForbiddenException);
      });

      it('deve lançar ForbiddenException se o responsável denunciar a própria solicitação', async () => {
        prismaMock.adoptionRequest.findUnique.mockResolvedValue({
          id: 'req-1',
          adopterId: 'other',
          responsibleUserId: reporterId,
        } as AdoptionRequest);

        await expect(service.createReport(reporterId, dto)).rejects.toThrow(ForbiddenException);
      });
    });

    describe('Inválido', () => {
      it('deve lançar BadRequestException para tipo inválido', async () => {
        const dto = {
          targetType: 'INVALID' as unknown as ModerationTargetType,
          targetId: 'id',
          reason: 'reason',
        };

        await expect(service.createReport(reporterId, dto)).rejects.toThrow(BadRequestException);
      });
    });
  });
});
