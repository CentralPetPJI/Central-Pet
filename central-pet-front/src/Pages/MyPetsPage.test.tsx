import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MyPetsPage from '@/Pages/MyPetsPage';

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
      id: '33333333-3333-3333-3333-333333333333',
    },
    isLoading: false,
  }),
}));

describe('MyPetsPage', () => {
  beforeEach(() => {
    getMock.mockReset();
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
            adoptionStatus: 'IN_PROCESS',
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
    expect(screen.getByText('Em processo')).toBeInTheDocument();
  });
});
