/**
 * Mock de usuários para desenvolvimento
 * Usado pelo sistema de autenticação mock
 */

export type MockUser = {
  id: string;
  fullName: string;
  email: string;
  role: 'PESSOA_FISICA' | 'ONG';
  city?: string;
  state?: string;
  birthDate?: Date;
  cpf?: string;
  organizationName?: string;
  cnpj?: string;
  phone?: string;
  mobile?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  foundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
  acceptedTermsAt?: Date;
};

export const mockUserIds = {
  ONG_PATAS_DO_CENTRO: '550e8400-e29b-41d4-a716-446655440000',
  LAR_TEMPORARIO_QUATRO_PATAS: '550e8400-e29b-41d4-a716-446655440001',
  JULIANA_MARTINS: '550e8400-e29b-41d4-a716-446655440002',
  RAFAEL_LIMA: '550e8400-e29b-41d4-a716-446655440003',
  ANA_SOUZA: '550e8400-e29b-41d4-a716-446655440004',
} as const;

export const mockUsers: MockUser[] = [
  {
    id: mockUserIds.ONG_PATAS_DO_CENTRO,
    fullName: 'ONG Patas do Centro',
    email: 'contato@patasdocentro.org',
    role: 'ONG',
    city: 'São Paulo',
    state: 'SP',
    organizationName: 'ONG Patas do Centro',
    cnpj: '12.345.678/0001-90',
    createdAt: new Date('2026-03-01T10:00:00.000Z'),
    updatedAt: new Date('2026-03-01T10:00:00.000Z'),
    deleted: false,
    acceptedTermsAt: new Date('2026-03-01T09:00:00.000Z'),
  },
  {
    id: mockUserIds.LAR_TEMPORARIO_QUATRO_PATAS,
    fullName: 'Lar Temporario Quatro Patas',
    email: 'contato@quatropatas.org',
    role: 'ONG',
    city: 'Campinas',
    state: 'SP',
    organizationName: 'Lar Temporario Quatro Patas',
    cnpj: '98.765.432/0001-10',
    createdAt: new Date('2026-03-02T14:00:00.000Z'),
    updatedAt: new Date('2026-03-02T14:00:00.000Z'),
    deleted: false,
    acceptedTermsAt: new Date('2026-03-02T14:00:00.000Z'),
  },
  {
    id: mockUserIds.JULIANA_MARTINS,
    fullName: 'Juliana Martins',
    email: 'juliana.martins@email.com',
    role: 'PESSOA_FISICA',
    city: 'Santos',
    state: 'SP',
    birthDate: new Date('1988-11-03'),
    cpf: '456.789.123-00',
    createdAt: new Date('2026-03-04T08:15:00.000Z'),
    updatedAt: new Date('2026-03-04T08:15:00.000Z'),
    deleted: false,
    acceptedTermsAt: new Date('2026-03-10T09:00:00.000Z'),
  },
  {
    id: mockUserIds.RAFAEL_LIMA,
    fullName: 'Rafael Lima',
    email: 'rafael.lima@email.com',
    role: 'PESSOA_FISICA',
    city: 'Osasco',
    state: 'SP',
    birthDate: new Date('1994-06-15'),
    cpf: '123.456.789-00',
    createdAt: new Date('2026-03-05T09:30:00.000Z'),
    updatedAt: new Date('2026-03-05T09:30:00.000Z'),
    deleted: false,
  },
  {
    id: mockUserIds.ANA_SOUZA,
    fullName: 'Ana Souza',
    email: 'ana.souza@email.com',
    role: 'PESSOA_FISICA',
    city: 'Campinas',
    state: 'SP',
    birthDate: new Date('1990-01-20'),
    cpf: '987.654.321-00',
    createdAt: new Date('2026-03-06T16:20:00.000Z'),
    updatedAt: new Date('2026-03-06T16:20:00.000Z'),
    deleted: false,
  },
];

export const defaultMockUserId = mockUserIds.ONG_PATAS_DO_CENTRO;
