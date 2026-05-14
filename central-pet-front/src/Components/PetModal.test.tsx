import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import PetModal from '@/Components/PetModal';
import type { Pet } from '@/Models/pet';
import * as authModule from '@/lib/auth-context';

const petStub: Pet = {
  id: 42,
  name: 'Luna',
  species: 'dog',
  physicalCharacteristics: 'SRD, 3 anos, Femea, porte Medio',
  behavioralCharacteristics: 'Calma, sociavel',
  notes: 'Contato: 11999999999',
  photo: 'https://example.com/luna.png',
  city: 'Campinas',
  state: 'SP',
  responsibleUserId: 'user-2',
  sourceType: 'PESSOA_FISICA',
  sourceName: 'Luna',
};

describe('PetModal', () => {
  beforeEach(() => {
    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      currentUser: { id: 'user-1' },
      isLoading: false,
      users: [],
      selectUser: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  it('renderiza "Quero adotar" quando o usuário não é o dono', () => {
    render(
      <MemoryRouter>
        <PetModal petData={petStub} onClick={vi.fn()} />
      </MemoryRouter>,
    );

    const cta = screen.getByRole('link', { name: 'Quero adotar' });

    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '/pets/42');
    expect(screen.getByText(/Campinas\//i)).toBeInTheDocument();
    expect(screen.queryByText(/Notas:/i)).not.toBeInTheDocument();
  });

  it('renderiza "Ver Perfil" quando o usuário é o dono do pet', () => {
    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      currentUser: { id: 'user-2' },
      isLoading: false,
      users: [],
      selectUser: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(
      <MemoryRouter>
        <PetModal petData={petStub} onClick={vi.fn()} />
      </MemoryRouter>,
    );

    const cta = screen.getByRole('link', { name: 'Ver Perfil' });

    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '/pets/42');
  });
});
