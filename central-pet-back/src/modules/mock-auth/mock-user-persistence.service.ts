import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { MockUser } from '@/mocks';

@Injectable()
export class MockUserPersistenceService {
  constructor(private readonly prisma: PrismaService) {}

  async ensurePersistedUserExists(
    userId: string,
    mockUsersById?: Map<string, MockUser>,
  ): Promise<void> {
    const mockUser = mockUsersById?.get(userId);
    const MOCK_PASSWORD_HASH = 'mock-password-hash';

    if (!mockUser) {
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!existingUser) {
        throw new NotFoundException(`Usuário com id "${userId}" não encontrado`);
      }

      return;
    }

    await this.prisma.user.upsert({
      where: { id: mockUser.id },
      update: {
        fullName: mockUser.fullName,
        email: mockUser.email,
        role: mockUser.role,
      },
      create: {
        id: mockUser.id,
        fullName: mockUser.fullName,
        email: mockUser.email,
        role: mockUser.role,
        birthDate: mockUser.birthDate ?? null,
        cpf: null,
        organizationName: mockUser.organizationName ?? null,
        cnpj: null,
        passwordHash: MOCK_PASSWORD_HASH,
      },
    });
  }

  async ensurePersistedUsersExist(
    userIds: string[],
    mockUsersById?: Map<string, MockUser>,
  ): Promise<void> {
    await Promise.all(
      userIds.map((userId) => this.ensurePersistedUserExists(userId, mockUsersById)),
    );
  }

  async buildPersistedUserMap(
    adopterIds: string[],
    mockUsersById?: Map<string, MockUser>,
  ): Promise<Map<string, { id: string; fullName: string }>> {
    const missingIds = adopterIds.filter((id) => !mockUsersById?.has(id));
    if (missingIds.length === 0) {
      return new Map();
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: [...new Set(missingIds)] } },
      select: { id: true, fullName: true },
    });

    return new Map(users.map((u) => [u.id, u] as const));
  }
}
