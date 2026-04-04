import { Injectable } from '@nestjs/common';
import {
  mockAdoptionRequests,
  mockPets,
  mockUsers,
  type MockAdoptionRequest,
  type MockPet,
  type MockUser,
} from '../../mocks';
import {
  mapToReceivedAdoptionRequest,
  type ReceivedAdoptionRequest,
} from './models/received-adoption-request';

@Injectable()
export class AdoptionRequestsService {
  private readonly adoptionRequests: MockAdoptionRequest[] = [...mockAdoptionRequests];
  private readonly pets: MockPet[] = [...mockPets];
  private readonly users: MockUser[] = [...mockUsers];

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
}
