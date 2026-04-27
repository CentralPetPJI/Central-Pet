import { ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PetOwnerGuard } from './pet-owner.guard';
import { PetsService } from '../pets.service';
import { PetRecord } from '../models/pet-record';

describe('PetOwnerGuard', () => {
  let guard: PetOwnerGuard;
  let petsServiceMock: jest.Mocked<PetsService>;

  beforeEach(() => {
    petsServiceMock = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<PetsService>;
    guard = new PetOwnerGuard(petsServiceMock);
  });

  const createMockContext = (userId?: string, petId?: string): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: userId ? { id: userId } : undefined,
          params: { id: petId },
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('deve permitir acesso se o usuário for o dono do pet', async () => {
    const userId = 'user-123';
    const petId = 'pet-456';
    const context = createMockContext(userId, petId);

    petsServiceMock.findOne.mockResolvedValue({
      message: 'Retrieved',
      data: { responsibleUserId: userId } as PetRecord,
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(petsServiceMock.findOne).toHaveBeenCalledWith(petId);
  });

  it('deve lançar ForbiddenException se o usuário NÃO for o dono do pet', async () => {
    const userId = 'user-123';
    const otherUserId = 'user-789';
    const petId = 'pet-456';
    const context = createMockContext(userId, petId);

    petsServiceMock.findOne.mockResolvedValue({
      message: 'Retrieved',
      data: { responsibleUserId: otherUserId } as PetRecord,
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('deve lançar ForbiddenException se não houver usuário autenticado', async () => {
    const context = createMockContext(undefined, 'pet-123');
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('deve permitir acesso se não houver petId na rota (ex: criação)', async () => {
    const context = createMockContext('user-123', undefined);
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('deve propagar NotFoundException se o pet não existir', async () => {
    const petId = 'missing-pet';
    const context = createMockContext('user-123', petId);

    petsServiceMock.findOne.mockRejectedValue(new NotFoundException());

    await expect(guard.canActivate(context)).rejects.toThrow(NotFoundException);
  });
});
