import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MockUserChoiceGate } from './MockUserChoiceGate';

const { selectMockUserMock, isDevelopmentMock } = vi.hoisted(() => ({
  selectMockUserMock: vi.fn(),
  isDevelopmentMock: vi.fn(),
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    currentUser: null,
    isLoading: false,
    mockUsers: [
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
    selectMockUser: selectMockUserMock,
  }),
}));

vi.mock('@/lib/dev-mode', () => ({
  isDevelopment: isDevelopmentMock,
}));

describe('MockUserChoiceGate', () => {
  beforeEach(() => {
    selectMockUserMock.mockReset();
    isDevelopmentMock.mockReset();
  });

  it('renders the role picker in production and selects the chosen mock user', async () => {
    isDevelopmentMock.mockReturnValue(false);

    render(<MockUserChoiceGate />);

    expect(screen.getByRole('heading', { name: /Você é\?/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pessoa física/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ONG/i })).toBeInTheDocument();

    await screen.getByRole('button', { name: /Pessoa física/i }).click();

    expect(selectMockUserMock).toHaveBeenCalledWith('user-pessoa-fisica');
  });
});
