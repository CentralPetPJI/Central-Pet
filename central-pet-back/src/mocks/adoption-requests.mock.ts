/**
 * Mock de solicitações de adoção para desenvolvimento
 * Vinculadas aos mock users e mock pets
 */

import { mockUserIds } from './users.mock';

export type AdoptionRequestStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export type MockAdoptionRequest = {
  id: string;
  petId: number;
  adopterId: string;
  message: string;
  status: AdoptionRequestStatus;
  requestedAt: string;
  updatedAt: string;
};

/**
 * Solicitações de adoção seed:
 * - Rafael Lima quer adotar Buddy (ONG Patas do Centro)
 * - Ana Souza quer adotar Luna (ONG Patas do Centro)
 * - Rafael Lima quer adotar Mel (Juliana Martins)
 */
export const mockAdoptionRequests: MockAdoptionRequest[] = [
  {
    id: 'req-001',
    petId: 1, // Buddy
    adopterId: mockUserIds.RAFAEL_LIMA,
    message:
      'Olá! Tenho muito interesse em adotar o Buddy. Tenho casa com quintal grande e experiência com Golden Retrievers.',
    status: 'PENDING',
    requestedAt: '2026-03-15T10:30:00.000Z',
    updatedAt: '2026-03-15T10:30:00.000Z',
  },
  {
    id: 'req-002',
    petId: 2, // Luna
    adopterId: mockUserIds.ANA_SOUZA,
    message:
      'Oi! Moro em apartamento tranquilo e sempre quis ter uma gata. A Luna parece perfeita!',
    status: 'UNDER_REVIEW',
    requestedAt: '2026-03-16T14:00:00.000Z',
    updatedAt: '2026-03-16T16:00:00.000Z',
  },
  {
    id: 'req-003',
    petId: 4, // Mel
    adopterId: mockUserIds.RAFAEL_LIMA,
    message:
      'Gostaria de conhecer a Mel. Tenho dois gatos em casa e procuro um terceiro para completar a família.',
    status: 'APPROVED',
    requestedAt: '2026-03-17T09:00:00.000Z',
    updatedAt: '2026-03-18T11:00:00.000Z',
  },
  {
    id: 'req-004',
    petId: 3, // Max
    adopterId: mockUserIds.ANA_SOUZA,
    message: 'Tenho duas crianças e o Max seria perfeito para nossa família!',
    status: 'PENDING',
    requestedAt: '2026-03-18T15:30:00.000Z',
    updatedAt: '2026-03-18T15:30:00.000Z',
  },
];
