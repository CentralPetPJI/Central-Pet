import { Test, TestingModule } from '@nestjs/testing';
import { ModerationService } from './moderation.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { ForbiddenException, ConflictException, NotFoundException } from '@nestjs/common';
import { Pet, Prisma, ModerationReport } from '../../../generated/prisma/client';
import { prismaMock } from '../../../singleton';
import { ModerationTargetType } from './moderation-target-type';

describe('ModerationService', () => {
  let service: ModerationService;

  const mockAuditService = {
    createWithTx: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModerationService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<ModerationService>(ModerationService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('createReport', () => {
    const reporterId = 'user-1';
    const dto = {
      targetType: ModerationTargetType.PET,
      targetId: 'pet-1',
      reason: 'Conteúdo impróprio',
    };

    it('deve lançar NotFoundException se o pet não existir', async () => {
      prismaMock.pet.findUnique.mockResolvedValue(null);

      await expect(service.createReport(reporterId, dto)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se o dono denunciar o próprio pet', async () => {
      prismaMock.pet.findUnique.mockResolvedValue({
        id: 'pet-1',
        responsibleUserId: reporterId,
      } as Pet);

      await expect(service.createReport(reporterId, dto)).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar ConflictException se a denúncia já existir', async () => {
      prismaMock.pet.findUnique.mockResolvedValue({
        id: 'pet-1',
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
      prismaMock.pet.findUnique.mockResolvedValue({
        id: 'pet-1',
        responsibleUserId: 'other-user',
      } as Pet);
      prismaMock.moderationReport.findUnique.mockResolvedValue(null);
      prismaMock.moderationReport.create.mockResolvedValue({ id: 'report-1' } as ModerationReport);

      // Mock da transação para retornar o próprio prismaMock

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
          targetId: dto.targetId,
          reason: dto.reason,
        },
      });
      expect(mockAuditService.createWithTx).toHaveBeenCalled();
    });
  });
});
