import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Carousel from '@/Components/Carousel';
import type { Pet } from '@/Models/pet';
import * as authModule from '@/lib/auth-context';
import { ModalManager } from '@/Components/ModalManager';
import { useModalStore } from '@/storage';

const petsStub: Pet[] = [
  {
    id: 7,
    name: 'Bolt',
    species: 'dog',
    physicalCharacteristics: 'SRD, 2 anos, Macho, porte Medio',
    behavioralCharacteristics: 'Brincalhao',
    notes: 'Tutor: Ana',
    photo: 'https://example.com/bolt.png',
    city: 'Osasco',
    state: 'SP',
    responsibleUserId: 'user-1',
    sourceType: 'PESSOA_FISICA',
    sourceName: 'Ana',
  },
];

describe('Carousel', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn(() => 1),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      currentUser: { id: 'user-2' },
      isLoading: false,
      users: [],
      selectUser: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    useModalStore.getState().actions.closeModal();
  });

  it('abre o modal com os dados do pet ao clicar no card', () => {
    render(
      <MemoryRouter>
        <ModalManager />
        <Carousel petsData={petsStub} />
      </MemoryRouter>,
    );

    expect(screen.getAllByText('Bolt')).toHaveLength(1);

    fireEvent.click(screen.getAllByText('Bolt')[0]);

    // O modal deve ser renderizado pelo ModalManager fora do Carousel
    expect(screen.getByRole('heading', { level: 2, name: 'Bolt' })).toBeInTheDocument();
    expect(screen.getAllByText('Osasco/São Paulo')[0]).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Quero adotar' })).toHaveAttribute('href', '/pets/7');
  });
});
