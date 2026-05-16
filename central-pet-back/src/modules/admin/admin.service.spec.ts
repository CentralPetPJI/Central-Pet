import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AdminService } from './admin.service';
import { PrismaService } from '@/prisma/prisma.service';
import { UsersService } from '@/modules/users/users.service';
import { PetsService } from '@/modules/pets/pets.service';
import { PetStatsEventsService } from '@/modules/pets/pet-stats-events.service';
import { AuditService } from '@/modules/audit/audit.service';
import { prismaMock } from '../../../singleton';
import { Pet } from '../../../generated/prisma/client';

describe('AdminService', () => {
  let service: AdminService;
  let usersServiceMock: UsersService;
  let petsServiceMock: PetsService;
  let petStatsEventsMock: PetStatsEventsService;
  let auditServiceMock: AuditService;

  beforeEach(() => {
    // Nota: prismaMock é resetado automaticamente via singleton antes de cada teste

    // Mock manual de $transaction para a lógica de AdminService
    // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
    (prismaMock as any).$transaction = jest.fn((callback: any) => callback(prismaMock));

    usersServiceMock = {
      deactivateTransactional: jest.fn(),
      reactivateTransactional: jest.fn(),
      createByAdmin: jest.fn(),
    } as unknown as UsersService;

    petsServiceMock = {
      removeTransactional: jest.fn(),
      reactivatePetTransactional: jest.fn(),
    } as unknown as PetsService;

    petStatsEventsMock = {
      emitChanged: jest.fn(),
    } as unknown as PetStatsEventsService;

    auditServiceMock = {
      create: jest.fn(),
      createWithTx: jest.fn(),
    } as unknown as AuditService;

    service = new AdminService(
      prismaMock as unknown as PrismaService,
      usersServiceMock as unknown as UsersService,
      petsServiceMock as unknown as PetsService,
      petStatsEventsMock,
      auditServiceMock as unknown as AuditService,
    );
  });

  describe('togglePetDeletion', () => {
    const adminId = 'admin-1';
    const petId = 'pet-1';

    it('deve lançar NotFoundException se o pet não existir', async () => {
      prismaMock.pet.findUnique.mockResolvedValue(null);

      await expect(service.togglePetDeletion(petId, adminId)).rejects.toThrow(NotFoundException);
    });

    it('deve bloquear pet com sucesso se estiver disponível', async () => {
      const pet = { id: petId, deleted: false, status: 'AVAILABLE' } as unknown as Pet;
      prismaMock.pet.findUnique.mockResolvedValue(pet);

      const result = await service.togglePetDeletion(petId, adminId);

      expect(result.message).toBe('Pet bloqueado com sucesso');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(petsServiceMock.removeTransactional).toHaveBeenCalledWith(prismaMock, petId, adminId, {
        reason: 'Pet bloqueado por admin',
      });
    });

    it('deve lançar BadRequestException ao tentar bloquear pet já adotado', async () => {
      const pet = { id: petId, deleted: false, status: 'ADOPTED' } as unknown as Pet;
      prismaMock.pet.findUnique.mockResolvedValue(pet);

      await expect(service.togglePetDeletion(petId, adminId)).rejects.toThrow(
        new BadRequestException('Não é possível bloquear/desbloquear um pet que já foi adotado.'),
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(petsServiceMock.removeTransactional).not.toHaveBeenCalled();
    });

    it('deve reativar pet chamando PetsService.reactivatePetTransactional', async () => {
      const pet = { id: petId, deleted: true, status: 'UNAVAILABLE' } as unknown as Pet;
      prismaMock.pet.findUnique.mockResolvedValue(pet);

      const result = await service.togglePetDeletion(petId, adminId);

      expect(result.message).toBe('Pet desbloqueado com sucesso');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(petsServiceMock.reactivatePetTransactional).toHaveBeenCalledWith(
        prismaMock,
        petId,
        adminId,
        { reason: 'Pet desbloqueado por admin' },
      );
    });
  });
});
