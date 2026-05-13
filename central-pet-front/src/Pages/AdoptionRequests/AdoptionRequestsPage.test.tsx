import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdoptionRequestsPage from '@/Pages/AdoptionRequests/AdoptionRequestsPage';
import { AdoptionRequestStatus } from '@/Models/adoption-request-status';
import type { ReceivedAdoptionRequest } from '@/Models/pet';

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
    currentUser: { id: 'user-1' },
    isLoading: false,
  }),
}));

vi.mock('@/lib/dev-mode', () => ({
  isDevelopment: () => false,
}));

vi.mock('@/storage/pets', () => ({
  getPublicIdFromBackend: () => undefined,
}));

function makeRequest(
  overrides: Partial<ReceivedAdoptionRequest> & { id: string },
): ReceivedAdoptionRequest {
  const baseRequest: ReceivedAdoptionRequest = {
    id: 'req-base',
    pet: {
      id: 'pet-1',
      name: overrides.pet?.name ?? 'Pet Teste',
      species: 'DOG',
      city: 'São Paulo',
      state: 'SP',
      responsibleUserId: 'user-1',
      sourceType: 'PESSOA_FISICA',
      sourceName: 'Fulano',
      adoptionStatus: 'AVAILABLE',
    },
    adopter: {
      id: 'adopter-1',
      name: 'Adotante Teste',
      city: 'Campinas',
      state: 'SP',
    },
    message: 'Quero adotar',
    responsibleContactShareConsent: false,
    adopterContactShareConsent: false,
    status: overrides.status ?? AdoptionRequestStatus.PENDING,
    requestedAt: overrides.requestedAt ?? '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  };

  return {
    ...baseRequest,
    ...overrides,
    id: overrides.id,
  };
}

const pendingRequest = makeRequest({
  id: 'req-pending',
  pet: {
    id: 'pet-1',
    name: 'Rex',
    species: 'DOG',
    city: 'SP',
    state: 'SP',
    responsibleUserId: 'user-1',
    sourceType: 'PESSOA_FISICA',
    sourceName: 'Fulano',
    adoptionStatus: 'AVAILABLE',
  },
  status: AdoptionRequestStatus.PENDING,
  requestedAt: '2025-03-01T10:00:00Z',
});

const approvedRequest = makeRequest({
  id: 'req-approved',
  pet: {
    id: 'pet-2',
    name: 'Luna',
    species: 'CAT',
    city: 'SP',
    state: 'SP',
    responsibleUserId: 'user-1',
    sourceType: 'PESSOA_FISICA',
    sourceName: 'Fulano',
    adoptionStatus: 'AVAILABLE',
  },
  status: AdoptionRequestStatus.APPROVED,
  requestedAt: '2025-02-01T10:00:00Z',
});

const cancelledRequest = makeRequest({
  id: 'req-cancelled',
  pet: {
    id: 'pet-3',
    name: 'Bolinha',
    species: 'DOG',
    city: 'SP',
    state: 'SP',
    responsibleUserId: 'user-1',
    sourceType: 'PESSOA_FISICA',
    sourceName: 'Fulano',
    adoptionStatus: 'UNAVAILABLE',
  },
  status: AdoptionRequestStatus.CANCELLED,
  blockNote:
    'Este pet foi cancelado e não está mais disponível para adoção. A solicitação foi cancelada automaticamente.',
  requestedAt: '2025-01-01T10:00:00Z',
});

describe('AdoptionRequestsPage', () => {
  beforeEach(() => {
    getMock.mockReset();
    getMock.mockImplementation((_url: string, { params }: { params: { type: string } }) => {
      if (params.type === 'received') {
        return Promise.resolve({
          data: { data: [approvedRequest, pendingRequest, cancelledRequest] },
        });
      }
      return Promise.resolve({ data: { data: [] } });
    });
  });

  it('exibe filtro de status quando há solicitações carregadas', async () => {
    render(
      <MemoryRouter>
        <AdoptionRequestsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Todos/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Pendentes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aprovadas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Canceladas/i })).toBeInTheDocument();
  });

  it('prioriza solicitações PENDING no topo da listagem', async () => {
    render(
      <MemoryRouter>
        <AdoptionRequestsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Rex')).toBeInTheDocument();
    });

    const headings = screen.getAllByRole('heading', { level: 2 });
    const petNames = headings.map((h) => h.textContent);
    expect(petNames[0]).toBe('Rex'); // PENDING deve aparecer primeiro
  });

  it('filtra solicitações por status Pendentes', async () => {
    render(
      <MemoryRouter>
        <AdoptionRequestsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Pendentes/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Pendentes/i }));

    expect(screen.getByText('Rex')).toBeInTheDocument();
    expect(screen.queryByText('Luna')).not.toBeInTheDocument();
    expect(screen.queryByText('Bolinha')).not.toBeInTheDocument();
  });

  it('filtra solicitações por status Canceladas e exibe badge correto', async () => {
    render(
      <MemoryRouter>
        <AdoptionRequestsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Canceladas/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Canceladas/i }));

    expect(screen.getByText('Bolinha')).toBeInTheDocument();
    expect(screen.queryByText('Rex')).not.toBeInTheDocument();
    expect(screen.getByText('Cancelada')).toBeInTheDocument();
  });

  it('mostra bloqueio e remove acesso ao perfil quando o pet está indisponível', async () => {
    render(
      <MemoryRouter>
        <AdoptionRequestsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Bolinha')).toBeInTheDocument();
    });

    const unavailableCard = screen.getByText('Bolinha').closest('article');
    expect(unavailableCard).not.toBeNull();
    expect(
      within(unavailableCard as HTMLElement).getByText(/Bloqueio do pet:/i),
    ).toBeInTheDocument();
    expect(
      within(unavailableCard as HTMLElement).getByText('Perfil indisponível'),
    ).toBeInTheDocument();
    expect(
      within(unavailableCard as HTMLElement).queryByRole('link', { name: /Ver perfil do pet/i }),
    ).not.toBeInTheDocument();
  });

  it('exibe mensagem de vazio quando o filtro não retorna resultados', async () => {
    getMock.mockImplementation((_url: string, { params }: { params: { type: string } }) => {
      if (params.type === 'received') {
        return Promise.resolve({
          data: { data: [approvedRequest] },
        });
      }
      return Promise.resolve({ data: { data: [] } });
    });

    render(
      <MemoryRouter>
        <AdoptionRequestsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Pendentes/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Pendentes/i }));

    expect(
      screen.getByText('Nenhuma solicitação encontrada para o filtro selecionado'),
    ).toBeInTheDocument();
  });

  it('exibe a contagem de pendentes no badge da aba Recebidas', async () => {
    render(
      <MemoryRouter>
        <AdoptionRequestsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      // badge with pending count "1" should appear next to the "Recebidas" tab
      const recebidaTab = screen.getByRole('button', { name: /Recebidas/i });
      expect(recebidaTab).toBeInTheDocument();
    });

    // The pending count badge shows the number of PENDING requests (1 in this test)
    const recebidaTab = screen.getByRole('button', { name: /Recebidas/i });
    expect(recebidaTab.textContent).toContain('1');
  });
});
