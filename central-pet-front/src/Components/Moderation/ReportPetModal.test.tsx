import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ComponentProps } from 'react';
import ReportPetModal from './ReportPetModal';

describe('ReportPetModal', () => {
  let defaultProps: ComponentProps<typeof ReportPetModal>;

  beforeEach(() => {
    defaultProps = {
      isOpen: true,
      onClose: vi.fn<() => void>(),
      onConfirm: vi.fn<(reason: string) => Promise<void>>().mockResolvedValue(undefined),
      petName: 'Rex',
    };
  });

  it('deve renderizar corretamente quando aberto', () => {
    render(<ReportPetModal {...defaultProps} />);
    expect(screen.getByText(/Denunciar Pet/i)).toBeInTheDocument();
    expect(screen.getByText(/Rex/)).toBeInTheDocument();
  });

  it('deve chamar onClose quando o botão cancelar é clicado', () => {
    render(<ReportPetModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/Cancelar/i));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('deve mostrar erro se o motivo estiver vazio', async () => {
    render(<ReportPetModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/Enviar Denúncia/i));
    expect(screen.getByText(/Por favor, descreva o motivo da denúncia/i)).toBeInTheDocument();
  });

  it('deve chamar onConfirm com o motivo quando enviado', async () => {
    render(<ReportPetModal {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/Descreva detalhadamente o motivo/i);
    fireEvent.change(textarea, { target: { value: 'Conteúdo impróprio' } });
    fireEvent.click(screen.getByText(/Enviar Denúncia/i));

    await waitFor(() => {
      expect(defaultProps.onConfirm).toHaveBeenCalledWith('Conteúdo impróprio');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('deve mostrar erro se o onConfirm falhar', async () => {
    const errorConfirm = vi.fn().mockRejectedValue({
      response: { data: { message: 'Erro personalizado do servidor' } },
    });
    render(<ReportPetModal {...defaultProps} onConfirm={errorConfirm} />);

    const textarea = screen.getByPlaceholderText(/Descreva detalhadamente o motivo/i);
    fireEvent.change(textarea, { target: { value: 'Conteúdo impróprio' } });
    fireEvent.click(screen.getByText(/Enviar Denúncia/i));

    await waitFor(() => {
      expect(screen.getByText(/Erro personalizado do servidor/i)).toBeInTheDocument();
    });
  });
});
