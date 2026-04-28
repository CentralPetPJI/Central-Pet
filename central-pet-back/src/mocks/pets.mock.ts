/**
 * Mock de pets para desenvolvimento
 * Pets vinculados aos mock users para testes
 */

import { mockUserIds } from './users.mock';

export type MockPet = {
  id: number;
  name: string;
  species: string;
  breed?: string;
  ageMonths?: number;
  size?: string;
  sex?: string;
  color?: string;
  photo?: string;
  description?: string;
  vaccinated: boolean;
  neutered: boolean;
  dewormed: boolean;
  adoptionStatus: string;
  responsibleUserId: string;
  sourceType: 'ONG' | 'PESSOA_FISICA';
  sourceName: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Pets seed vinculados aos mock users:
 * - ONG Patas do Centro: Buddy, Luna
 * - Lar Temporário Quatro Patas: Max
 * - Juliana Martins: Mel, Thor
 */
export const mockPets: MockPet[] = [
  {
    id: 1,
    name: 'Buddy',
    species: 'dog',
    breed: 'Golden Retriever',
    ageMonths: 36,
    size: 'large',
    sex: 'male',
    color: 'Dourado',
    description: 'Golden retriever amigável, ativo e adora brincar de buscar',
    vaccinated: true,
    neutered: true,
    dewormed: true,
    adoptionStatus: 'AVAILABLE',
    responsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
    sourceType: 'ONG',
    sourceName: 'ONG Patas do Centro',
    createdAt: new Date('2026-03-10T10:00:00.000Z'),
    updatedAt: new Date('2026-03-10T10:00:00.000Z'),
  },
  {
    id: 2,
    name: 'Luna',
    species: 'cat',
    breed: 'British Shorthair',
    ageMonths: 24,
    size: 'medium',
    sex: 'female',
    color: 'Cinza',
    description: 'Gata calma, carinhosa, gosta de lugares tranquilos',
    vaccinated: true,
    neutered: true,
    dewormed: true,
    adoptionStatus: 'AVAILABLE',
    responsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
    sourceType: 'ONG',
    sourceName: 'ONG Patas do Centro',
    createdAt: new Date('2026-03-11T14:00:00.000Z'),
    updatedAt: new Date('2026-03-11T14:00:00.000Z'),
  },
  {
    id: 3,
    name: 'Max',
    species: 'dog',
    breed: 'Labrador',
    ageMonths: 48,
    size: 'large',
    sex: 'male',
    color: 'Preto',
    description: 'Labrador tranquilo, ótimo com criancas',
    vaccinated: true,
    neutered: false,
    dewormed: true,
    adoptionStatus: 'AVAILABLE',
    responsibleUserId: mockUserIds.LAR_TEMPORARIO_QUATRO_PATAS,
    sourceType: 'ONG',
    sourceName: 'Lar Temporario Quatro Patas',
    createdAt: new Date('2026-03-12T09:00:00.000Z'),
    updatedAt: new Date('2026-03-12T09:00:00.000Z'),
  },
  {
    id: 4,
    name: 'Mel',
    species: 'cat',
    breed: 'SRD',
    ageMonths: 18,
    size: 'small',
    sex: 'female',
    color: 'Laranja',
    description: 'Gatinha resgatada, muito carinhosa',
    vaccinated: true,
    neutered: true,
    dewormed: true,
    adoptionStatus: 'AVAILABLE',
    responsibleUserId: mockUserIds.JULIANA_MARTINS,
    sourceType: 'PESSOA_FISICA',
    sourceName: 'Juliana Martins',
    createdAt: new Date('2026-03-13T16:00:00.000Z'),
    updatedAt: new Date('2026-03-13T16:00:00.000Z'),
  },
  {
    id: 5,
    name: 'Thor',
    species: 'dog',
    breed: 'Pit Bull',
    ageMonths: 60,
    size: 'large',
    sex: 'male',
    color: 'Branco e marrom',
    description: 'Cão forte e protetor, precisa de adotante experiente',
    vaccinated: true,
    neutered: true,
    dewormed: true,
    adoptionStatus: 'AVAILABLE',
    responsibleUserId: mockUserIds.JULIANA_MARTINS,
    sourceType: 'PESSOA_FISICA',
    sourceName: 'Juliana Martins',
    createdAt: new Date('2026-03-14T11:00:00.000Z'),
    updatedAt: new Date('2026-03-14T11:00:00.000Z'),
  },
];
