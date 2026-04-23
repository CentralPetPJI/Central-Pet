import { Link } from 'react-router-dom';

type AdoptionRequestsPageHeaderProps = {
  showSimulationAction: boolean;
  onOpenSimulationPanel: () => void;
  title?: string;
  description?: string;
};

export function AdoptionRequestsPageHeader({
  showSimulationAction,
  onOpenSimulationPanel,
  title = 'Solicitações de adoção recebidas',
  description = 'Gerencie as solicitações de adoção dos pets que você cadastrou. Para cada pedido, você pode revisar a mensagem do interessado, verificar a localização e decidir se compartilha seu contato para dar continuidade ao processo de adoção ou rejeitar caso o pet já tenha sido adotado ou não seja mais adequado.',
}: AdoptionRequestsPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-3xl bg-linear-to-r from-amber-50 via-white to-cyan-50 p-5 shadow-sm ring-1 ring-slate-200 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">{description}</p>
      </div>

      <Link
        to="/pets/new"
        className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
      >
        Cadastrar novo pet
      </Link>

      {showSimulationAction ? (
        <button
          type="button"
          onClick={onOpenSimulationPanel}
          className="inline-flex items-center justify-center rounded-full border border-cyan-300 bg-white px-5 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
        >
          Simular solicitação
        </button>
      ) : null}
    </div>
  );
}
