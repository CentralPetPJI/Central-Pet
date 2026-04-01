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
  description?: string;
  vaccinated: boolean;
  neutered: boolean;
  dewormed: boolean;
  adoptionStatus: string;
  city?: string;
  state?: string;
  responsibleUserId: string;
  sourceType?: 'ONG' | 'PESSOA_FISICA';
  sourceName?: string;
  createdAt: string;
  updatedAt: string;
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
    species: 'Cachorro',
    breed: 'Golden Retriever',
    ageMonths: 36,
    size: 'GRANDE',
    sex: 'MACHO',
    color: 'Dourado',
    description: 'Golden retriever amigável, ativo e adora brincar de buscar',
    vaccinated: true,
    neutered: true,
    dewormed: true,
    adoptionStatus: 'AVAILABLE',
    city: 'São Paulo',
    state: 'SP',
    responsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
    sourceType: 'ONG',
    sourceName: 'ONG Patas do Centro',
    createdAt: '2026-03-10T10:00:00.000Z',
    updatedAt: '2026-03-10T10:00:00.000Z',
  },
  {
    id: 2,
    name: 'Luna',
    species: 'Gato',
    breed: 'British Shorthair',
    ageMonths: 24,
    size: 'MEDIO',
    sex: 'FEMEA',
    color: 'Cinza',
    description: 'Gata calma, carinhosa, gosta de lugares tranquilos',
    vaccinated: true,
    neutered: true,
    dewormed: true,
    adoptionStatus: 'AVAILABLE',
    city: 'São Paulo',
    state: 'SP',
    responsibleUserId: mockUserIds.ONG_PATAS_DO_CENTRO,
    sourceType: 'ONG',
    sourceName: 'ONG Patas do Centro',
    createdAt: '2026-03-11T14:00:00.000Z',
    updatedAt: '2026-03-11T14:00:00.000Z',
  },
  {
    id: 3,
    name: 'Max',
    species: 'Cachorro',
    breed: 'Labrador',
    ageMonths: 48,
    size: 'GRANDE',
    sex: 'MACHO',
    color: 'Preto',
    description: 'Labrador tranquilo, ótimo com crianças',
    vaccinated: true,
    neutered: false,
    dewormed: true,
    adoptionStatus: 'AVAILABLE',
    city: 'Campinas',
    state: 'SP',
    responsibleUserId: mockUserIds.LAR_TEMPORARIO_QUATRO_PATAS,
    sourceType: 'ONG',
    sourceName: 'Lar Temporario Quatro Patas',
    createdAt: '2026-03-12T09:00:00.000Z',
    updatedAt: '2026-03-12T09:00:00.000Z',
  },
  {
    id: 4,
    name: 'Mel',
    species: 'Gato',
    breed: 'SRD',
    ageMonths: 18,
    size: 'PEQUENO',
    sex: 'FEMEA',
    color: 'Laranja',
    description: 'Gatinha resgatada, muito carinhosa',
    vaccinated: true,
    neutered: true,
    dewormed: true,
    adoptionStatus: 'AVAILABLE',
    city: 'Sorocaba',
    state: 'SP',
    responsibleUserId: mockUserIds.JULIANA_MARTINS,
    sourceType: 'PESSOA_FISICA',
    sourceName: 'Juliana Martins',
    createdAt: '2026-03-13T16:00:00.000Z',
    updatedAt: '2026-03-13T16:00:00.000Z',
  },
  {
    id: 5,
    name: 'Thor',
    species: 'Cachorro',
    breed: 'Pit Bull',
    ageMonths: 60,
    size: 'GRANDE',
    sex: 'MACHO',
    color: 'Branco e marrom',
    description: 'Cão forte e protetor, precisa de tutor experiente',
    vaccinated: true,
    neutered: true,
    dewormed: true,
    adoptionStatus: 'AVAILABLE',
    city: 'Sorocaba',
    state: 'SP',
    responsibleUserId: mockUserIds.JULIANA_MARTINS,
    sourceType: 'PESSOA_FISICA',
    sourceName: 'Juliana Martins',
    createdAt: '2026-03-14T11:00:00.000Z',
    updatedAt: '2026-03-14T11:00:00.000Z',
  },
];
