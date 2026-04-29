import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import PetModal from '@/Components/PetModal';
import type { Pet } from '@/Models/pet';

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
  it('renderiza o CTA para o perfil completo do pet', () => {
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
});
