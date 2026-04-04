import { Injectable } from '@nestjs/common';
import { mockPets, mockUsers, mockUserIds } from '@/mocks';
import {
  mapToPetHistoryRecord,
  resolvePetHistoryPetName,
  resolvePetHistoryUser,
  type PetHistoryRecord,
} from './models/pet-history-record';

const trackedPetId = 'b2b5c4b8-c6f7-4b63-82c1-5cbb5bfeb001';
const trackedUserId = mockUserIds.ONG_PATAS_DO_CENTRO;

const buddy = mockPets.find((pet) => pet.id === 1);
const luna = mockPets.find((pet) => pet.id === 2);
const rafael = mockUsers.find((user) => user.fullName === 'Rafael Lima');
const juliana = mockUsers.find((user) => user.fullName === 'Juliana Martins');

const historyRecords: PetHistoryRecord[] = [
  mapToPetHistoryRecord({
    id: 'hist-001',
    petId: trackedPetId,
    petName: resolvePetHistoryPetName(buddy, 'Buddy'),
    userId: trackedUserId,
    fullName: 'ONG Patas do Centro',
    eventName: 'PET_REGISTERED',
    createdAt: '2026-03-10T10:00:00.000Z',
  }),
  mapToPetHistoryRecord({
    id: 'hist-002',
    petId: 'pet-history-002',
    petName: resolvePetHistoryPetName(luna, 'Luna'),
    userId: trackedUserId,
    fullName: 'ONG Patas do Centro',
    eventName: 'RETURNED',
    createdAt: '2026-03-12T10:00:00.000Z',
  }),
  mapToPetHistoryRecord({
    id: 'hist-003',
    petId: trackedPetId,
    petName: resolvePetHistoryPetName(buddy, 'Buddy'),
    userId: resolvePetHistoryUser(rafael, 'user-raf', 'Rafael Lima').id,
    fullName: resolvePetHistoryUser(rafael, 'user-raf', 'Rafael Lima').fullName,
    eventName: 'ADOPTION',
    createdAt: '2026-03-15T10:00:00.000Z',
  }),
  mapToPetHistoryRecord({
    id: 'hist-004',
    petId: trackedPetId,
    petName: resolvePetHistoryPetName(buddy, 'Buddy'),
    userId: resolvePetHistoryUser(juliana, 'user-jul', 'Juliana Martins').id,
    fullName: resolvePetHistoryUser(juliana, 'user-jul', 'Juliana Martins').fullName,
    eventName: 'RETURNED',
    createdAt: '2026-03-18T10:00:00.000Z',
  }),
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
