import { Injectable } from '@nestjs/common';
import {
  mockAdoptionRequests,
  mockPets,
  mockUsers,
  type MockAdoptionRequest,
  type MockPet,
  type MockUser,
} from '../../mocks';

type ReceivedAdoptionRequest = {
  id: string;
  pet: {
    id: number;
    name: string;
    species: string;
    city: string;
    state: string;
    responsibleUserId: string;
    sourceType: 'ONG' | 'PESSOA_FISICA';
    sourceName: string;
  };
  adopter: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
  message: string;
  status: MockAdoptionRequest['status'];
  requestedAt: string;
};

@Injectable()
export class AdoptionRequestsService {
  private readonly adoptionRequests: MockAdoptionRequest[] = [...mockAdoptionRequests];
  private readonly pets: MockPet[] = [...mockPets];
  private readonly users: MockUser[] = [...mockUsers];

  findReceived(responsibleUserId?: string) {
    const data = this.adoptionRequests
      .map((request) => {
        const pet = this.pets.find((item) => item.id === request.petId);
        const adopter = this.users.find((item) => item.id === request.adopterId);

        if (!pet || !adopter) {
          return null;
        }

        const receivedRequest: ReceivedAdoptionRequest = {
          id: request.id,
          pet: {
            id: pet.id,
            name: pet.name,
            species: pet.species,
            city: pet.city ?? 'UNKNOWN_CITY',
            state: pet.state ?? 'UNKNOWN_STATE',
            responsibleUserId: pet.responsibleUserId,
            sourceType: pet.sourceType ?? 'ONG',
            sourceName: pet.sourceName ?? 'UNKNOWN_SOURCE',
          },
          adopter: {
            id: adopter.id,
            name: adopter.fullName,
            city: adopter.city ?? 'UNKNOWN_CITY',
            state: adopter.state ?? 'UNKNOWN_STATE',
          },
          message: request.message,
          status: request.status,
          requestedAt: request.requestedAt,
        };

        return receivedRequest;
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
