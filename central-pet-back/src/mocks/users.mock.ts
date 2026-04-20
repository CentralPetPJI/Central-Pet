/**
 * Mock de usuários para desenvolvimento
 * Usado pelo sistema de autenticação mock
 */
import { User } from '../../generated/prisma/client';
import { randomUUID } from 'crypto';

/**
 * MockUser: tipo para facilitar mocks de usuários, baseado em User do Prisma
 * Permite campos opcionais para facilitar criação de mocks
 */
export type MockUser = Omit<User, 'birthDate' | 'cpf' | 'city' | 'state'> & {
  birthDate?: Date;
  cpf?: string;
  city?: string;
  state?: string;
};

/**
 * Identificadores fixos para usuários mockados
 */
export const mockUserIds = {
  ONG_PATAS_DO_CENTRO: '550e8400-e29b-41d4-a716-446655440000',
  LAR_TEMPORARIO_QUATRO_PATAS: '550e8400-e29b-41d4-a716-446655440001',
  JULIANA_MARTINS: '550e8400-e29b-41d4-a716-446655440002',
  RAFAEL_LIMA: '550e8400-e29b-41d4-a716-446655440003',
  ANA_SOUZA: '550e8400-e29b-41d4-a716-446655440004',
} as const;

/**
 * Lista de usuários mockados
 * Usuários do tipo ONG não possuem dados institucionais diretamente
 */
export const mockUsers: MockUser[] = [
  {
    id: mockUserIds.ONG_PATAS_DO_CENTRO,
    fullName: 'ONG Patas do Centro',
    email: 'contato@patasdocentro.org',
    role: 'ONG',
    phone: null,
    mobile: null,
    passwordHash: '',
    deleted: false,
    createdAt: new Date('2026-03-01T10:00:00.000Z'),
    updatedAt: new Date('2026-03-01T10:00:00.000Z'),
  },
  {
    id: mockUserIds.LAR_TEMPORARIO_QUATRO_PATAS,
    fullName: 'Lar Temporário Quatro Patas',
    email: 'contato@quatropatas.org',
    role: 'ONG',
    phone: null,
    mobile: null,
    passwordHash: '',
    deleted: false,
    createdAt: new Date('2026-03-02T14:00:00.000Z'),
    updatedAt: new Date('2026-03-02T14:00:00.000Z'),
  },
  {
    id: mockUserIds.JULIANA_MARTINS,
    fullName: 'Juliana Martins',
    email: 'juliana.martins@email.com',
    role: 'PESSOA_FISICA',
    birthDate: new Date('1988-11-03'),
    cpf: '456.789.123-00',
    city: 'Ribeirão Preto',
    state: 'SP',
    phone: null,
    mobile: null,
    passwordHash: '',
    deleted: false,
    createdAt: new Date('2026-03-04T08:15:00.000Z'),
    updatedAt: new Date('2026-03-04T08:15:00.000Z'),
  },
  {
    id: mockUserIds.RAFAEL_LIMA,
    fullName: 'Rafael Lima',
    email: 'rafael.lima@email.com',
    role: 'PESSOA_FISICA',
    birthDate: new Date('1994-06-15'),
    cpf: '123.456.789-00',
    city: 'Osasco',
    state: 'SP',
    phone: null,
    mobile: null,
    passwordHash: '',
    deleted: false,
    createdAt: new Date('2026-03-05T09:30:00.000Z'),
    updatedAt: new Date('2026-03-05T09:30:00.000Z'),
  },
  {
    id: mockUserIds.ANA_SOUZA,
    fullName: 'Ana Souza',
    email: 'ana.souza@email.com',
    role: 'PESSOA_FISICA',
    birthDate: new Date('1990-01-20'),
    cpf: '987.654.321-00',
    city: 'Campinas',
    state: 'SP',
    phone: null,
    mobile: null,
    passwordHash: '',
    deleted: false,
    createdAt: new Date('2026-03-06T16:20:00.000Z'),
    updatedAt: new Date('2026-03-06T16:20:00.000Z'),
  },
];

/**
 * Tipo para mock de instituições
 */
export type InstitutionMock = {
  id: string;
  userId: string; // deve ser o id de um usuário do tipo ONG
  name: string;
  description?: string;
  cnpj?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  foundedAt?: Date;
  verified: boolean;
  verificationLinks?: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Lista de instituições mockadas
 * Cada instituição está vinculada a um usuário do tipo ONG via userId
 */
export const institutionsMock: InstitutionMock[] = [
  {
    id: randomUUID(),
    userId: mockUserIds.ONG_PATAS_DO_CENTRO,
    name: 'ONG Patas do Centro',
    description: 'Resgate e cuidado de animais em situação de rua na região central de SP.',
    cnpj: '12.345.678/0001-90',
    instagram: '@patasdocentro',
    facebook: 'fb.com/patasdocentro',
    website: 'https://patasdocentro.org',
    foundedAt: new Date('2018-05-10'),
    verified: true,
    verificationLinks: 'https://patasdocentro.org/estatuto.pdf',
    createdAt: new Date('2026-03-01T10:00:00.000Z'),
    updatedAt: new Date('2026-03-01T10:00:00.000Z'),
  },
  {
    id: randomUUID(),
    userId: mockUserIds.LAR_TEMPORARIO_QUATRO_PATAS,
    name: 'Lar Temporário Quatro Patas',
    description: 'Abrigo temporário para cães e gatos resgatados em Campinas.',
    cnpj: '98.765.432/0001-10',
    instagram: '@quatropatas',
    facebook: 'fb.com/quatropatas',
    website: 'https://quatropatas.org',
    foundedAt: new Date('2020-08-15'),
    verified: false,
    verificationLinks: '',
    createdAt: new Date('2026-03-02T14:00:00.000Z'),
    updatedAt: new Date('2026-03-02T14:00:00.000Z'),
  },
];

/**
 * Usuário padrão para autenticação mock
 */
export const defaultMockUserId = mockUserIds.ONG_PATAS_DO_CENTRO;
