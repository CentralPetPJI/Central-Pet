import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SidePanel from '@/Components/SidePanel';

describe('SidePanel', () => {
  it('renderiza labels no singular e plural conforme a contagem', () => {
    render(<SidePanel speciesCounts={{ dog: 1, cat: 2 }} />);

    expect(screen.getByText('Cachorro cadastrado')).toBeInTheDocument();
    expect(screen.getByText('Gatos cadastrados')).toBeInTheDocument();
  });

  it('usa zero quando a especie nao existe no mapa de contagem', () => {
    render(<SidePanel speciesCounts={{ dog: 3 }} />);

    expect(
      screen.getAllByRole('heading', { level: 2 }).some((element) => element.textContent === '0'),
    ).toBe(true);
    expect(screen.getByText('Cachorros cadastrados')).toBeInTheDocument();
    expect(screen.getByText('Gatos cadastrados')).toBeInTheDocument();
  });
});
