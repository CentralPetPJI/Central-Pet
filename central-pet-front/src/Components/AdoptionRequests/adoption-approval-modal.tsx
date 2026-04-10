type ApprovalModalData = {
  requestId: string;
  petName: string;
};

type AdoptionApprovalModalProps = {
  modalData: ApprovalModalData | null;
  approvalNote: string;
  approvalConfirmed: boolean;
  isSubmitting: boolean;
  onApprovalNoteChange: (value: string) => void;
  onApprovalConfirmedChange: (value: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function AdoptionApprovalModal({
  modalData,
  approvalNote,
  approvalConfirmed,
  isSubmitting,
  onApprovalNoteChange,
  onApprovalConfirmedChange,
  onCancel,
  onConfirm,
}: AdoptionApprovalModalProps) {
  if (!modalData) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="approval-modal-title"
      >
        <h2 id="approval-modal-title" className="text-xl font-bold text-slate-900">
          Aprovar adoção
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Confirme que o pet <span className="font-semibold text-slate-900">{modalData.petName}</span> foi
          adotado.
        </p>

        <div className="mt-5">
          <label htmlFor="approval-note" className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Observações da aprovação (opcional)
            </span>
            <textarea
              id="approval-note"
              value={approvalNote}
              onChange={(event) => onApprovalNoteChange(event.target.value)}
              placeholder="Ex: Adoção concluída após visita e assinatura do termo..."
              className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              rows={4}
            />
          </label>
        </div>

        <label className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-3 text-sm text-slate-700 ring-1 ring-slate-200">
          <input
            type="checkbox"
            checked={approvalConfirmed}
            onChange={(event) => onApprovalConfirmedChange(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
          />
          Confirmo que a adoção foi efetivada.
        </label>

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
            disabled={isSubmitting || !approvalConfirmed}
            onClick={onConfirm}
            className="flex-1 inline-flex items-center justify-center rounded-full bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Aprovando...' : 'Confirmar aprovação'}
          </button>
        </div>
      </div>
    </div>
  );
}
