import { BadRequestException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import {
  mockAdoptionRequests,
  mockPets,
  mockUsers,
  type MockAdoptionRequest,
  type MockPet,
  type MockUser,
} from '@/mocks';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdoptionRequestDto } from './dto/create-adoption-request.dto';
import {
  mapToReceivedAdoptionRequest,
  type ReceivedAdoptionRequest,
} from './models/received-adoption-request';

@Injectable()
export class AdoptionRequestsService {
  private readonly adoptionRequests: MockAdoptionRequest[] = [...mockAdoptionRequests];
  private readonly pets: MockPet[] = [...mockPets];
  private readonly users: MockUser[] = [...mockUsers];

  constructor(private readonly prisma?: PrismaService) {}

  findReceived(responsibleUserId?: string): { message: string; data: ReceivedAdoptionRequest[] } {
    const data = this.adoptionRequests
      .map((request) => {
        const pet = this.pets.find((item) => item.id === request.petId);
        const adopter = this.users.find((item) => item.id === request.adopterId);

        if (!pet || !adopter) {
          return null;
        }

        return mapToReceivedAdoptionRequest({ request, pet, adopter });
      })
      .filter((request): request is ReceivedAdoptionRequest => request !== null)
      .filter((request) =>
        responsibleUserId ? request.pet.responsibleUserId === responsibleUserId : true,
      )
      .sort(
        (left, right) =>
          new Date(right.requestedAt).getTime() - new Date(left.requestedAt).getTime(),
      );

    return {
      message: 'Received adoption requests retrieved successfully',
      data,
    };
  }

  async create(createAdoptionRequestDto: CreateAdoptionRequestDto) {
    if (!this.prisma) {
      throw new Error('PrismaService is not available');
    }

    const pet = await this.prisma.pet.findUnique({
      where: { id: createAdoptionRequestDto.petId },
      select: { id: true, name: true, status: true },
    });

    if (!pet) {
      throw new NotFoundException(`Pet with id "${createAdoptionRequestDto.petId}" not found`);
    }

    if (pet.status !== 'AVAILABLE') {
      throw new BadRequestException(
        `Adoption request cannot be created for pet with status "${pet.status}"`,
      );
    }

    const requester = await this.prisma.user.findUnique({
      where: { id: createAdoptionRequestDto.requesterId },
      select: { id: true, fullName: true, email: true },
    });

    if (!requester) {
      throw new NotFoundException(
        `User with id "${createAdoptionRequestDto.requesterId}" not found`,
      );
    }

    const data = await this.prisma.adoptionRequest.create({
      data: {
        petId: createAdoptionRequestDto.petId,
        requesterId: createAdoptionRequestDto.requesterId,
        message: createAdoptionRequestDto.message,
        status: 'PENDING',
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        requester: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return {
      message: 'Adoption request created successfully',
      data,
    };
  }

  async findOne(id: string) {
    if (!this.prisma) {
      throw new Error('PrismaService is not available');
    }

    const data = await this.prisma.adoptionRequest.findUnique({
      where: { id },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        requester: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!data) {
      throw new NotFoundException(`Adoption request with id "${id}" not found`);
    }

    return {
      message: 'Adoption request retrieved successfully',
      data,
    };
  }
}
