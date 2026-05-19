import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SearchPetsPage from './SearchPetsPage';
import { usePetSearchStore } from '@/storage';

// Mock da store
const { setFiltersMock, fetchPetsMock, clearFiltersMock } = vi.hoisted(() => ({
  setFiltersMock: vi.fn(),
  fetchPetsMock: vi.fn(),
  clearFiltersMock: vi.fn(),
}));

vi.mock('@/storage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/storage')>();
  return {
    ...actual,
    usePetSearchStore: vi.fn(),
  };
});

const usePetSearchStoreMock = vi.mocked(usePetSearchStore);

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location-search">{location.search}</div>;
}

describe('SearchPetsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePetSearchStoreMock.mockReturnValue({
      pets: [],
      isLoading: false,
      error: null,
      filters: { adoptionStatus: 'AVAILABLE' },
      actions: {
        setFilters: setFiltersMock,
        fetchPets: fetchPetsMock,
        clearFilters: clearFiltersMock,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  it('carrega filtros iniciais a partir da URL', () => {
    render(
      <MemoryRouter initialEntries={['/buscar-pets?species=CAT&size=SMALL']}>
        <Routes>
          <Route path="/buscar-pets" element={<SearchPetsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(setFiltersMock).toHaveBeenCalledWith(
      expect.objectContaining({
        species: 'CAT',
        size: 'SMALL',
      }),
    );
  });

  it('sincroniza filtros com a URL e permite limpar', () => {
    render(
      <MemoryRouter initialEntries={['/buscar-pets']}>
        <Routes>
          <Route
            path="/buscar-pets"
            element={
              <>
                <SearchPetsPage />
                <LocationDisplay />
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Espécie'), { target: { value: 'CAT' } });
    fireEvent.change(screen.getByLabelText('Porte'), { target: { value: 'SMALL' } });

    expect(screen.getByTestId('location-search').textContent).toContain('species=CAT');
    expect(screen.getByTestId('location-search').textContent).toContain('size=SMALL');

    fireEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));

    expect(screen.getByTestId('location-search').textContent).toBe('');
    expect(clearFiltersMock).toHaveBeenCalled();
  });
});
