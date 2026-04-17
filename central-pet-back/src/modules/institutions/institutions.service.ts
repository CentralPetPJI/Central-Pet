import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class InstitutionsService {
  constructor(private readonly prisma: PrismaService) {}

  // TODO: Hoje ong é um tipo de usuário, mas talvez seja interessante criar uma entidade separada para instituições, caso seja necessário armazenar informações específicas ou permitir que pessoas físicas criem instituições. Por enquanto, vamos manter como está, mas é algo a se considerar para o futuro.
  // Considerar que uma ong pode ter varios abrigos (instituicoes)
  async findAllPublic() {
    const users = await this.prisma.user.findMany({
      where: { role: 'ONG' },
      select: {
        id: true,
        organizationName: true,
        city: true,
        state: true,
        email: true,
        createdAt: true,
        birthDate: true,
        fullName: true,
        _count: {
          select: { responsiblePets: true },
        },
      },
      orderBy: { organizationName: 'asc' },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.organizationName ?? u.fullName ?? 'Instituição',
      city: u.city,
      state: u.state,
      email: u.email,
      createdAt: u.createdAt.toISOString(),
      petsCount: u._count?.responsiblePets ?? 0,
    }));
  }

  async findByIdPublic(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        organizationName: true,
        city: true,
        state: true,
        email: true,
        createdAt: true,
        birthDate: true,
        fullName: true,
        _count: {
          select: { responsiblePets: true },
        },
      },
    });

    if (!user) throw new NotFoundException('Instituição não encontrada');

    return {
      id: user.id,
      name: user.organizationName ?? user.fullName ?? 'Instituição',
      city: user.city,
      state: user.state,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      petsCount: user._count?.responsiblePets ?? 0,
    };
  }
}
