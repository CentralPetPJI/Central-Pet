import { Injectable, NotFoundException } from '@nestjs/common';

export type MockUser = {
  id: string;
  fullName: string;
  email: string;
  role: 'ADOTANTE' | 'ONG' | 'DOADOR_INDEPENDENTE';
  birthDate?: string;
  cpf?: string;
  organizationName?: string;
  cnpj?: string;
  createdAt: string;
  updatedAt: string;
};

const mockUsersSeed: MockUser[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    fullName: 'ONG Patas do Centro',
    email: 'contato@patasdocentro.org',
    role: 'ONG',
    organizationName: 'ONG Patas do Centro',
    cnpj: '12.345.678/0001-90',
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    fullName: 'Lar Temporario Quatro Patas',
    email: 'contato@quatropatas.org',
    role: 'ONG',
    organizationName: 'Lar Temporario Quatro Patas',
    cnpj: '98.765.432/0001-10',
    createdAt: '2026-03-02T14:00:00.000Z',
    updatedAt: '2026-03-02T14:00:00.000Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    fullName: 'Juliana Martins',
    email: 'juliana.martins@email.com',
    role: 'DOADOR_INDEPENDENTE',
    birthDate: '1988-11-03',
    cpf: '456.789.123-00',
    createdAt: '2026-03-04T08:15:00.000Z',
    updatedAt: '2026-03-04T08:15:00.000Z',
  },
  {
    id: 'c6d69776-cfdc-497a-a7c6-c89e42f2a002',
    fullName: 'Rafael Lima',
    email: 'rafael.lima@email.com',
    role: 'ADOTANTE',
    birthDate: '1994-06-15',
    cpf: '123.456.789-00',
    createdAt: '2026-03-05T09:30:00.000Z',
    updatedAt: '2026-03-05T09:30:00.000Z',
  },
  {
    id: 'c6d69776-cfdc-497a-a7c6-c89e42f2a001',
    fullName: 'Ana Souza',
    email: 'ana.souza@email.com',
    role: 'ADOTANTE',
    birthDate: '1990-01-20',
    cpf: '987.654.321-00',
    createdAt: '2026-03-06T16:20:00.000Z',
    updatedAt: '2026-03-06T16:20:00.000Z',
  },
];

@Injectable()
export class MockAuthService {
  private readonly mockUsers = [...mockUsersSeed];
  private readonly defaultUserId = '11111111-1111-1111-1111-111111111111';

  listUsers() {
    return {
      message: 'Mock users retrieved successfully',
      data: {
        users: this.mockUsers,
        defaultUserId: this.defaultUserId,
      },
    };
  }

  getCurrentUser(mockUserId?: string) {
    const userId = mockUserId ?? this.defaultUserId;
    const user = this.mockUsers.find((item) => item.id === userId);

    if (!user) {
      throw new NotFoundException(`Mock user with id "${userId}" not found`);
    }

    return {
      message: 'Authenticated mock user retrieved successfully',
      data: {
        user,
      },
    };
  }
}
