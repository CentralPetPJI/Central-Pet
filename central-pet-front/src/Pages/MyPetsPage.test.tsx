import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MyPetsPage from '@/Pages/MyPetsPage';

const { getMock, deleteMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  api: {
    get: getMock,
    delete: deleteMock,
  },
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    currentUser: {
      id: '33333333-3333-3333-3333-333333333333',
    },
    isLoading: false,
  }),
}));

describe('Pagina Meus Pets', () => {
  beforeEach(() => {
    getMock.mockReset();
    deleteMock.mockReset();
  });

  it('renderiza a lista de pets cadastrados pelo usuario atual', async () => {
    getMock.mockResolvedValue({
      data: {
        data: [
          {
            id: '4',
            name: 'Pringles',
            species: 'CAT',
            breed: 'Bengal',
            city: 'Campinas',
            state: 'SP',
            adoptionStatus: 'AVAILABLE',
            responsibleUserId: '33333333-3333-3333-3333-333333333333',
          },
        ],
      },
    });

    render(
      <MemoryRouter>
        <MyPetsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Pringles' })).toBeInTheDocument();
    });

    expect(getMock).toHaveBeenCalledWith('/pets', {
      params: {
        responsibleUserId: '33333333-3333-3333-3333-333333333333',
      },
    });
    expect(screen.getByText('Disponível')).toBeInTheDocument();
  });

  it('nao exibe pets de outro usuario quando backend retorna lista mista', async () => {
    getMock.mockResolvedValue({
      data: {
        data: [
          {
            id: '4',
            name: 'Pringles',
            species: 'CAT',
            adoptionStatus: 'AVAILABLE',
            responsibleUserId: '33333333-3333-3333-3333-333333333333',
          },
          {
            id: '5',
            name: 'Thor',
            species: 'DOG',
            adoptionStatus: 'AVAILABLE',
            responsibleUserId: '99999999-9999-9999-9999-999999999999',
          },
        ],
      },
    });

    render(
      <MemoryRouter>
        <MyPetsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Pringles' })).toBeInTheDocument();
    });

    expect(screen.queryByRole('heading', { name: 'Thor' })).not.toBeInTheDocument();
  });

  it('permite excluir um pet da listagem', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    getMock.mockResolvedValue({
      data: {
        data: [
          {
            id: '4',
            name: 'Pringles',
            species: 'CAT',
            adoptionStatus: 'AVAILABLE',
            responsibleUserId: '33333333-3333-3333-3333-333333333333',
          },
        ],
      },
    });
    deleteMock.mockResolvedValue({ data: {} });

    render(
      <MemoryRouter>
        <MyPetsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Pringles' })).toBeInTheDocument();
    });

    screen.getByRole('button', { name: 'Excluir pet' }).click();

    await waitFor(() => {
      expect(deleteMock).toHaveBeenCalledWith('/pets/4');
    });
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Pringles' })).not.toBeInTheDocument();
    });

    expect(confirmSpy).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('nao exclui pet quando usuario cancela a confirmacao', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    getMock.mockResolvedValue({
      data: {
        data: [
          {
            id: '4',
            name: 'Pringles',
            species: 'CAT',
            adoptionStatus: 'AVAILABLE',
            responsibleUserId: '33333333-3333-3333-3333-333333333333',
          },
        ],
      },
    });

    render(
      <MemoryRouter>
        <MyPetsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Pringles' })).toBeInTheDocument();
    });

    screen.getByRole('button', { name: 'Excluir pet' }).click();

    expect(deleteMock).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Pringles' })).toBeInTheDocument();
    confirmSpy.mockRestore();
  });

  it('mantem pet na listagem quando API falha ao excluir', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    getMock.mockResolvedValue({
      data: {
        data: [
          {
            id: '4',
            name: 'Pringles',
            species: 'CAT',
            adoptionStatus: 'AVAILABLE',
            responsibleUserId: '33333333-3333-3333-3333-333333333333',
          },
        ],
      },
    });
    const error = new Error('Erro ao excluir pet');
    deleteMock.mockRejectedValue(error);

    render(
      <MemoryRouter>
        <MyPetsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Pringles' })).toBeInTheDocument();
    });

    screen.getByRole('button', { name: 'Excluir pet' }).click();

    await waitFor(() => {
      expect(deleteMock).toHaveBeenCalledWith('/pets/4');
    });
    expect(screen.getByRole('heading', { name: 'Pringles' })).toBeInTheDocument();
    confirmSpy.mockRestore();
  });
});
