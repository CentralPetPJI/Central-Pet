import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ReportPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  petName: string;
}

const ReportPetModal: React.FC<ReportPetModalProps> = ({ isOpen, onClose, onConfirm, petName }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setReason('');
      setError(null);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Por favor, descreva o motivo da denúncia.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm(reason);
      onClose();
      setReason('');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar denúncia. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            <h2 id="report-modal-title" className="text-xl font-bold">
              Denunciar Pet
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Fechar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-600">
          Você está denunciando o pet <strong>{petName}</strong>. Por favor, explique o motivo da
          denúncia (conteúdo impróprio, maus-tratos, informações falsas, etc).
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="reason" className="block text-sm font-semibold text-slate-700 mb-1">
              Motivo da denúncia
            </label>
            <textarea
              id="reason"
              rows={4}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400 transition"
              placeholder="Descreva detalhadamente o motivo..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
            />
            {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-slate-300 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-full bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Denúncia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportPetModal;
