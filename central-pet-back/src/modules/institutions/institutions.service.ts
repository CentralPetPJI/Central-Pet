import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateInstitutionDto, UpdateInstitutionDto } from './dto/institution.dto';
import { UserPersistenceService } from '@/modules/users/user-persistence.service';

@Injectable()
export class InstitutionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userPersistence: UserPersistenceService,
  ) {}

  async remove(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role === 'ONG') {
      throw new ConflictException('ONGs não podem desativar sua página de instituição.');
    }

    const existing = await this.prisma.institution.findUnique({
      where: { userId },
    });

    if (!existing) {
      throw new NotFoundException('Instituição não encontrada para este usuário');
    }

    return this.prisma.institution.update({
      where: { userId },
      data: { deleted: true },
    });
  }

  async create(userId: string, dto: CreateInstitutionDto) {
    const existing = await this.prisma.institution.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('O usuário já possui uma instituição cadastrada');
    }

    return this.prisma.institution.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async update(userId: string, dto: UpdateInstitutionDto) {
    const existing = await this.prisma.institution.findUnique({
      where: { userId },
    });

    if (!existing) {
      throw new NotFoundException('Instituição não encontrada para este usuário');
    }

    return this.prisma.institution.update({
      where: { userId },
      data: dto,
    });
  }

  async findByUserId(userId: string) {
    await this.userPersistence.validateUser(userId);
    return this.prisma.institution.findUnique({
      where: { userId, deleted: false },
    });
  }

  async findAllPublic() {
    const institutions = await this.prisma.institution.findMany({
      where: { deleted: false },
      include: {
        user: {
          select: {
            city: true,
            state: true,
            email: true,
            _count: {
              select: { responsiblePets: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return institutions.map((inst) => ({
      id: inst.id,
      userId: inst.userId,
      name: inst.name,
      city: inst.user.city,
      state: inst.user.state,
      email: inst.user.email, // Use user email as fallback or primary
      verified: inst.verified,
      createdAt: inst.createdAt.toISOString(),
      petsCount: inst.user._count?.responsiblePets ?? 0,
    }));
  }

  async findByIdPublic(id: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id, deleted: false },
      include: {
        user: {
          select: {
            city: true,
            state: true,
            email: true,
            phone: true,
            mobile: true,
            _count: {
              select: { responsiblePets: true },
            },
          },
        },
      },
    });

    if (!institution) throw new NotFoundException('Instituição não encontrada');

    return {
      id: institution.id,
      userId: institution.userId,
      name: institution.name,
      description: institution.description,
      city: institution.user.city,
      state: institution.user.state,
      email: institution.user.email,
      phone: institution.user.phone,
      mobile: institution.user.mobile,
      instagram: institution.instagram,
      facebook: institution.facebook,
      website: institution.website,
      verified: institution.verified,
      createdAt: institution.createdAt.toISOString(),
      petsCount: institution.user._count?.responsiblePets ?? 0,
    };
  }
}
