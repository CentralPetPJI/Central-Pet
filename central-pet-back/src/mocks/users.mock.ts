/**
 * Mock de usuários para desenvolvimento
 * Usado pelo sistema de autenticação mock
 */

import { randomUUID } from 'crypto';

export type MockUser = {
  id: string;
  fullName: string;
  email: string;
  role: 'PESSOA_FISICA' | 'ONG';
  city?: string;
  state?: string;
  birthDate?: string;
  cpf?: string;
  organizationName?: string;
  cnpj?: string;
  createdAt: string;
  updatedAt: string;
};

export const mockUserIds = {
  ONG_PATAS_DO_CENTRO: randomUUID(),
  LAR_TEMPORARIO_QUATRO_PATAS: randomUUID(),
  JULIANA_MARTINS: randomUUID(),
  RAFAEL_LIMA: randomUUID(),
  ANA_SOUZA: randomUUID(),
} as const;

export const mockUsers: MockUser[] = [
  {
    id: mockUserIds.ONG_PATAS_DO_CENTRO,
    fullName: 'ONG Patas do Centro',
    email: 'contato@patasdocentro.org',
    role: 'ONG',
    organizationName: 'ONG Patas do Centro',
    cnpj: '12.345.678/0001-90',
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: mockUserIds.LAR_TEMPORARIO_QUATRO_PATAS,
    fullName: 'Lar Temporario Quatro Patas',
    email: 'contato@quatropatas.org',
    role: 'ONG',
    organizationName: 'Lar Temporario Quatro Patas',
    cnpj: '98.765.432/0001-10',
    createdAt: '2026-03-02T14:00:00.000Z',
    updatedAt: '2026-03-02T14:00:00.000Z',
  },
  {
    id: mockUserIds.JULIANA_MARTINS,
    fullName: 'Juliana Martins',
    email: 'juliana.martins@email.com',
    role: 'PESSOA_FISICA',
    birthDate: '1988-11-03',
    cpf: '456.789.123-00',
    createdAt: '2026-03-04T08:15:00.000Z',
    updatedAt: '2026-03-04T08:15:00.000Z',
  },
  {
    id: mockUserIds.RAFAEL_LIMA,
    fullName: 'Rafael Lima',
    email: 'rafael.lima@email.com',
    role: 'PESSOA_FISICA',
    city: 'Osasco',
    state: 'SP',
    birthDate: '1994-06-15',
    cpf: '123.456.789-00',
    createdAt: '2026-03-05T09:30:00.000Z',
    updatedAt: '2026-03-05T09:30:00.000Z',
  },
  {
    id: mockUserIds.ANA_SOUZA,
    fullName: 'Ana Souza',
    email: 'ana.souza@email.com',
    role: 'PESSOA_FISICA',
    city: 'Campinas',
    state: 'SP',
    birthDate: '1990-01-20',
    cpf: '987.654.321-00',
    createdAt: '2026-03-06T16:20:00.000Z',
    updatedAt: '2026-03-06T16:20:00.000Z',
  },
];

export const defaultMockUserId = mockUserIds.ONG_PATAS_DO_CENTRO;
