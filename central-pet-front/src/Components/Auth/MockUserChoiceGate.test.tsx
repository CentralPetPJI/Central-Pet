import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MockUserChoiceGate } from './MockUserChoiceGate';

const { selectUserMock, isDevelopmentMock } = vi.hoisted(() => ({
  selectUserMock: vi.fn(),
  isDevelopmentMock: vi.fn(),
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    currentUser: null,
    isLoading: false,
    users: [
      {
        id: 'user-pessoa-fisica',
        fullName: 'Rafael Lima',
        role: 'PESSOA_FISICA',
      },
      {
        id: 'user-ong',
        fullName: 'ONG Patas do Centro',
        role: 'ONG',
      },
    ],
    selectUser: selectUserMock,
  }),
}));

vi.mock('@/lib/dev-mode', () => ({
  isDevelopment: isDevelopmentMock,
}));

describe('MockUserChoiceGate', () => {
  beforeEach(() => {
    selectUserMock.mockReset();
    isDevelopmentMock.mockReset();
  });

  it('renderiza o seletor de perfil em producao e seleciona o usuario escolhido', async () => {
    isDevelopmentMock.mockReturnValue(false);

    render(<MockUserChoiceGate />);

    expect(screen.getByRole('heading', { name: /Você é\?/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pessoa física/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ONG/i })).toBeInTheDocument();

    await screen.getByRole('button', { name: /Pessoa física/i }).click();

    expect(selectUserMock).toHaveBeenCalledWith('user-pessoa-fisica');
  });
});
