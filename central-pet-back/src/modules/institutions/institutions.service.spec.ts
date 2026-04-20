import { Test, TestingModule } from '@nestjs/testing';
import { InstitutionsService } from './institutions.service';
import { PrismaService } from '@/prisma/prisma.service';
import { UserPersistenceService } from '@/modules/users/user-persistence.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('InstitutionsService', () => {
  let service: InstitutionsService;

  const mockPrisma = {
    institution: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockUserPersistence = {
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstitutionsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UserPersistenceService, useValue: mockUserPersistence },
      ],
    }).compile();

    service = module.get<InstitutionsService>(InstitutionsService);
  });

  it('should throw ConflictException if user is ONG', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ role: 'ONG' });
    await expect(service.remove('user-id')).rejects.toThrow(ConflictException);
  });

  it('should throw NotFoundException if institution not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ role: 'PESSOA_FISICA' });
    mockPrisma.institution.findUnique.mockResolvedValue(null);
    await expect(service.remove('user-id')).rejects.toThrow(NotFoundException);
  });

  it('should soft delete institution if user is PF and exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ role: 'PESSOA_FISICA' });
    mockPrisma.institution.findUnique.mockResolvedValue({ id: 'inst-id' });
    mockPrisma.institution.update.mockResolvedValue({ id: 'inst-id', deleted: true });

    await expect(service.remove('user-id')).resolves.toBeDefined();
    expect(mockPrisma.institution.update).toHaveBeenCalledWith({
      where: { userId: 'user-id' },
      data: { deleted: true },
    });
  });
});
