import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Carousel from '@/Components/Carousel';
import type { Pet } from '@/Models/pet';

const petsStub: Pet[] = [
  {
    id: 7,
    name: 'Bolt',
    species: 'dog',
    physicalCharacteristics: 'SRD, 2 anos, Macho, porte Medio',
    behavioralCharacteristics: 'Brincalhao',
    notes: 'Tutor: Ana',
    photo: 'https://example.com/bolt.png',
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
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('abre o modal com os dados do pet ao clicar no card', () => {
    render(
      <MemoryRouter>
        <Carousel petsData={petsStub} />
      </MemoryRouter>,
    );

    expect(screen.getAllByText('Bolt')).toHaveLength(1);

    fireEvent.click(screen.getAllByText('Bolt')[0]);

    expect(screen.getByRole('heading', { level: 2, name: 'Bolt' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Quero adotar' })).toHaveAttribute('href', '/pets/7');
  });
});
