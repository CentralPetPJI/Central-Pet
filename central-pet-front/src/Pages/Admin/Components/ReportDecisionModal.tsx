import { useState } from 'react';

type DecisionModalData = {
  id: string;
  petName?: string;
  targetType: string;
};

type ReportDecisionModalProps = {
  modalData: DecisionModalData | null;
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: (status: 'APPROVED' | 'REJECTED', blockPet: boolean) => void;
};

export function ReportDecisionModal({
  modalData,
  isSubmitting,
  onCancel,
  onConfirm,
}: ReportDecisionModalProps) {
  const [blockPet, setBlockPet] = useState<boolean>(() => Boolean(modalData?.targetType === 'PET'));

  if (!modalData) return null;

  const handleCancel = () => {
    onCancel();
  };

  const handleReject = () => {
    onConfirm('REJECTED', false);
  };

  const handleApprove = () => {
    onConfirm('APPROVED', blockPet);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-decision-title"
      >
        <h2 id="report-decision-title" className="text-xl font-bold text-slate-900">
          Resolver denúncia
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Você está prestes a resolver uma denúncia
          {modalData.petName ? ` do pet ${modalData.petName}` : ''}.
        </p>

        {modalData.targetType === 'PET' && (
          <label className="mt-4 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={blockPet}
              onChange={(e) => setBlockPet(e.target.checked)}
              className="h-4 w-4"
            />
            <span>Bloquear o pet ao aprovar (remover da listagem)</span>
          </label>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleReject}
            className="flex-1 inline-flex items-center justify-center rounded-full border border-red-600 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
          >
            Rejeitar denúncia
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleApprove}
            className="flex-1 inline-flex items-center justify-center rounded-full bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
          >
            Aprovar{isSubmitting ? '...' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
