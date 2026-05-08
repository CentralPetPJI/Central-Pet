import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SearchPetsPage from './SearchPetsPage';

const { usePetsMock } = vi.hoisted(() => ({
  usePetsMock: vi.fn(),
}));

vi.mock('@/lib/pets', () => ({
  usePets: usePetsMock,
}));

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location-search">{location.search}</div>;
}

describe('SearchPetsPage', () => {
  beforeEach(() => {
    usePetsMock.mockReset();
    usePetsMock.mockReturnValue({
      pets: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('carrega filtros iniciais a partir da URL', () => {
    render(
      <MemoryRouter initialEntries={['/buscar-pets?species=CAT&size=SMALL']}>
        <Routes>
          <Route path="/buscar-pets" element={<SearchPetsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(usePetsMock).toHaveBeenCalledWith(
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
  });
});
