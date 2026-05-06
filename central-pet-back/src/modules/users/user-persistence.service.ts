import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { mockUsers } from '@/mocks';

@Injectable()
export class UserPersistenceService {
  private readonly isProduction = process.env.NODE_ENV === 'production';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida se um usuário existe e o retorna do banco de dados.
   * Se o usuário não existir no banco mas for um ID de mock (em ambiente não-prod),
   * ele realiza a persistência automática (lazy loading) e retorna o novo registro.
   */
  async validateUser(userId: string) {
    const MOCK_PASSWORD_HASH = 'mock-password-hash';

    // 1. Tenta buscar no banco primeiro (rápido)
    const userInDb = await this.prisma.user.count({
      where: { id: userId, deleted: false },
    });

    if (userInDb > 0) {
      return true;
    }

    // 2. Se não encontrou e estamos em produção, erro imediato
    if (this.isProduction) {
      throw new NotFoundException(`Usuário com id "${userId}" não encontrado`);
    }

    // 3. Em desenvolvimento, verifica se é um ID de mock para persistência tardia
    const mockUser = mockUsers.find((u) => u.id === userId);
    if (!mockUser) {
      throw new NotFoundException(
        `Usuário com id "${userId}" não encontrado no banco ou catálogo mock`,
      );
    }

    // 4. Realiza o upsert do mock (e instituição se necessário)
    const persistedUser = await this.prisma.user.upsert({
      where: { id: mockUser.id },
      update: {
        fullName: mockUser.fullName,
        email: mockUser.email,
        role: mockUser.role,
        birthDate: mockUser.birthDate ?? null,
        cpf: mockUser.cpf ?? null,
        organizationName: mockUser.organizationName ?? null,
        cnpj: mockUser.cnpj ?? null,
        city: mockUser.city ?? null,
        state: mockUser.state ?? null,
        phone: mockUser.phone ?? null,
        mobile: mockUser.mobile ?? null,
        instagram: mockUser.instagram ?? null,
        facebook: mockUser.facebook ?? null,
        website: mockUser.website ?? null,
        foundedAt: mockUser.foundedAt ?? null,
        deleted: mockUser.deleted,
      },
      create: {
        id: mockUser.id,
        fullName: mockUser.fullName,
        email: mockUser.email,
        role: mockUser.role,
        birthDate: mockUser.birthDate ?? null,
        cpf: mockUser.cpf ?? null,
        passwordHash: MOCK_PASSWORD_HASH,
        organizationName: mockUser.organizationName ?? null,
        cnpj: mockUser.cnpj ?? null,
        city: mockUser.city ?? null,
        state: mockUser.state ?? null,
        phone: mockUser.phone ?? null,
        mobile: mockUser.mobile ?? null,
        instagram: mockUser.instagram ?? null,
        facebook: mockUser.facebook ?? null,
        website: mockUser.website ?? null,
        foundedAt: mockUser.foundedAt ?? null,
        deleted: mockUser.deleted,
        createdAt: mockUser.createdAt ?? undefined,
      },
    });

    return !!persistedUser;
  }

  /**
   * Garante a existência de múltiplos usuários.
   */
  async ensureUsersExist(userIds: string[]): Promise<void> {
    await Promise.all(userIds.map((id) => this.validateUser(id)));
  }

  /**
   * Helper para construir o mapa de usuários para mapeamento de respostas.
   */
  async buildUserMap(userIds: string[]) {
    const uniqueIds = [...new Set(userIds)];
    const users = await this.prisma.user.findMany({
      where: { id: { in: uniqueIds } },
      select: {
        id: true,
        fullName: true,
        email: true,
        city: true,
        state: true,
        phone: true,
        mobile: true,
      },
    });
    return new Map(users.map((u) => [u.id, u] as const));
  }
}
