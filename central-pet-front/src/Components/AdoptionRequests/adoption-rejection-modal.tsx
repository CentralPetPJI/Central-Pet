type RejectionModalData = {
  requestId: string;
  petName: string;
};

type AdoptionRejectionModalProps = {
  modalData: RejectionModalData | null;
  rejectionReason: string;
  isSubmitting: boolean;
  onRejectionReasonChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function AdoptionRejectionModal({
  modalData,
  rejectionReason,
  isSubmitting,
  onRejectionReasonChange,
  onCancel,
  onConfirm,
}: AdoptionRejectionModalProps) {
  if (!modalData) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rejection-modal-title"
      >
        <h2 id="rejection-modal-title" className="text-xl font-bold text-slate-900">
          Rejeitar solicitação
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Você está prestes a rejeitar a solicitação de adoção do pet{' '}
          <span className="font-semibold text-slate-900">{modalData.petName}</span>.
        </p>

        <div className="mt-5">
          <label htmlFor="rejection-reason" className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Motivo da recusa (opcional)
            </span>
            <textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(event) => onRejectionReasonChange(event.target.value)}
              placeholder="Ex: Já encontramos um lar para este pet..."
              className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              rows={4}
            />
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="flex-1 inline-flex items-center justify-center rounded-full bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Rejeitando...' : 'Confirmar rejeição'}
          </button>
        </div>
      </div>
    </div>
  );
}
