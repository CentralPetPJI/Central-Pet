import { Injectable } from '@nestjs/common';
import { mockPets, mockUsers, mockUserIds } from '../../mocks';

type PetHistoryRecord = {
  id: string;
  pet: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    fullName: string;
  };
  eventName: 'PET_REGISTERED' | 'ADOPTION' | 'RETURNED' | 'TRANSFERRED';
  createdAt: string;
};

const trackedPetId = 'b2b5c4b8-c6f7-4b63-82c1-5cbb5bfeb001';
const trackedUserId = mockUserIds.ONG_PATAS_DO_CENTRO;

const buddy = mockPets.find((pet) => pet.id === 1);
const luna = mockPets.find((pet) => pet.id === 2);
const rafael = mockUsers.find((user) => user.fullName === 'Rafael Lima');
const juliana = mockUsers.find((user) => user.fullName === 'Juliana Martins');

const historyRecords: PetHistoryRecord[] = [
  {
    id: 'hist-001',
    pet: {
      id: trackedPetId,
      name: buddy?.name ?? 'Buddy',
    },
    user: {
      id: trackedUserId,
      fullName: 'ONG Patas do Centro',
    },
    eventName: 'PET_REGISTERED',
    createdAt: '2026-03-10T10:00:00.000Z',
  },
  {
    id: 'hist-002',
    pet: {
      id: 'pet-history-002',
      name: luna?.name ?? 'Luna',
    },
    user: {
      id: trackedUserId,
      fullName: 'ONG Patas do Centro',
    },
    eventName: 'RETURNED',
    createdAt: '2026-03-12T10:00:00.000Z',
  },
  {
    id: 'hist-003',
    pet: {
      id: trackedPetId,
      name: buddy?.name ?? 'Buddy',
    },
    user: {
      id: rafael?.id ?? 'user-raf',
      fullName: rafael?.fullName ?? 'Rafael Lima',
    },
    eventName: 'ADOPTION',
    createdAt: '2026-03-15T10:00:00.000Z',
  },
  {
    id: 'hist-004',
    pet: {
      id: trackedPetId,
      name: buddy?.name ?? 'Buddy',
    },
    user: {
      id: juliana?.id ?? 'user-jul',
      fullName: juliana?.fullName ?? 'Juliana Martins',
    },
    eventName: 'RETURNED',
    createdAt: '2026-03-18T10:00:00.000Z',
  },
];

@Injectable()
export class PetHistoryService {
  findAll(userId?: string, petId?: string) {
    const data = historyRecords
      .filter((record) => (userId ? record.user.id === userId : true))
      .filter((record) => (petId ? record.pet.id === petId : true))
      .sort(
        (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
      );

    return {
      message: 'Pet history retrieved successfully',
      data,
    };
  }
}
