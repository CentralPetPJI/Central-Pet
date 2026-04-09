import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePetHistoryDto } from './dto/create-pet-history.dto';
import { PetHistoryEventType } from 'generated/prisma/enums';

@Injectable()
export class PetHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPetHistoryDto: CreatePetHistoryDto, performedByUserId?: string) {
    const pet = await this.prisma.pet.findUnique({
      where: { id: createPetHistoryDto.petId },
      select: { id: true },
    });

    if (!pet) {
      throw new NotFoundException(`Pet with id "${createPetHistoryDto.petId}" not found`);
    }

    if (performedByUserId) {
      const user = await this.prisma.user.findUnique({
        where: { id: performedByUserId },
        select: { id: true },
      });

      if (!user) {
        throw new NotFoundException(`User with id "${performedByUserId}" not found`);
      }
    }

    const data = await this.prisma.petHistory.create({
      data: {
        petId: createPetHistoryDto.petId,
        eventType: createPetHistoryDto.eventType as PetHistoryEventType,
        description: createPetHistoryDto.description,
        fromResponsible: createPetHistoryDto.fromResponsible,
        toResponsible: createPetHistoryDto.toResponsible,
        performedByUserId: performedByUserId,
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
        performedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return {
      message: 'Pet history created successfully',
      data,
    };
  }

  async findAll(userId?: string, petId?: string) {
    const data = await this.prisma.petHistory.findMany({
      where: {
        ...(userId ? { performedByUserId: userId } : {}),
        ...(petId ? { petId } : {}),
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
        performedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return {
      message: 'Pet history retrieved successfully',
      data,
    };
  }

  async findOne(id: string) {
    const data = await this.prisma.petHistory.findUnique({
      where: { id },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
        performedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!data) {
      throw new NotFoundException(`Pet history with id "${id}" not found`);
    }

    return {
      message: 'Pet history record retrieved successfully',
      data,
    };
  }

  async findByPetId(petId: string) {
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId },
      select: { id: true },
    });

    if (!pet) {
      throw new NotFoundException(`Pet with id "${petId}" not found`);
    }

    const data = await this.prisma.petHistory.findMany({
      where: { petId },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
        performedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return {
      message: 'Pet history retrieved successfully',
      data,
    };
  }
}
