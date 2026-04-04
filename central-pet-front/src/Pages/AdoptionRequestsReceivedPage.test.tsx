import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdoptionRequestsReceivedPage from '@/Pages/AdoptionRequestsReceivedPage';

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  api: {
    get: getMock,
  },
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    currentUser: {
      id: '11111111-1111-1111-1111-111111111111',
    },
    isLoading: false,
  }),
}));

describe('Pagina de solicitacoes recebidas', () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it('renderiza a lista de solicitacoes recebidas com os detalhes principais', async () => {
    getMock.mockResolvedValue({
      data: {
        data: [
          {
            id: 'request-1',
            pet: {
              id: 1,
              name: 'Nina',
              species: 'CAT',
              city: 'Sao Paulo',
              state: 'SP',
              responsibleUserId: '11111111-1111-1111-1111-111111111111',
              sourceType: 'ONG',
              sourceName: 'ONG Patas do Centro',
            },
            adopter: {
              id: 'adopter-1',
              name: 'Rafael Lima',
              city: 'Osasco',
              state: 'SP',
            },
            message: 'Tenho uma casa segura e ja convivo com gatos.',
            status: 'PENDING',
            requestedAt: '2026-03-31T09:15:00.000Z',
          },
        ],
      },
    });

    render(
      <MemoryRouter>
        <AdoptionRequestsReceivedPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Carregando solicitacoes...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Nina' })).toBeInTheDocument();
    });

    expect(screen.getByText('Rafael Lima')).toBeInTheDocument();
    expect(screen.getByText('Tenho uma casa segura e ja convivo com gatos.')).toBeInTheDocument();
    expect(screen.getByText('Pendente')).toBeInTheDocument();
    expect(screen.getByText('Osasco/SP')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver perfil do pet' })).toHaveAttribute(
      'href',
      '/pets/1',
    );
    expect(getMock).toHaveBeenCalledWith('/adoption-requests', {
      params: {
        type: 'received',
        responsibleUserId: '11111111-1111-1111-1111-111111111111',
      },
    });
  });

  it('renderiza estado vazio quando nao ha solicitacoes', async () => {
    getMock.mockResolvedValue({
      data: {
        data: [],
      },
    });

    render(
      <MemoryRouter>
        <AdoptionRequestsReceivedPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Nenhuma solicitacao recebida ate agora')).toBeInTheDocument();
    });
  });
});
