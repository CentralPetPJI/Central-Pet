import { formatPetSpecies } from '@/lib/formatters';
import type { PetApiResponse } from '@/Models/pet';

type AdoptionRequestsSimulationPanelProps = {
  ownPets: PetApiResponse[];
  selectedPetId: string;
  isLoadingOwnPets: boolean;
  isSimulating: boolean;
  simulateResponsibleContactShareConsent: boolean;
  simulateAdopterContactShareConsent: boolean;
  onSelectedPetIdChange: (value: string) => void;
  onSimulateResponsibleContactShareConsentChange: (value: boolean) => void;
  onSimulateAdopterContactShareConsentChange: (value: boolean) => void;
  onSimulate: () => void;
};

export function AdoptionRequestsSimulationPanel({
  ownPets,
  selectedPetId,
  isLoadingOwnPets,
  isSimulating,
  simulateResponsibleContactShareConsent,
  simulateAdopterContactShareConsent,
  onSelectedPetIdChange,
  onSimulateResponsibleContactShareConsentChange,
  onSimulateAdopterContactShareConsentChange,
  onSimulate,
}: AdoptionRequestsSimulationPanelProps) {
  return (
    <div className="mb-4 rounded-3xl border border-cyan-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
            Simulação de solicitação
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Escolha um pet cadastrado para gerar uma solicitação fake de teste.
          </p>
        </div>

        <button
          type="button"
          onClick={onSimulate}
          disabled={isSimulating || isLoadingOwnPets || ownPets.length === 0}
          className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSimulating ? 'Simulando...' : 'Gerar solicitação'}
        </button>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Pet</span>
          <select
            value={selectedPetId}
            onChange={(event) => onSelectedPetIdChange(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700"
          >
            {ownPets.length === 0 ? <option value="">Nenhum pet disponivel</option> : null}
            {ownPets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name} - {formatPetSpecies(pet.species)}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
          {isLoadingOwnPets ? 'Carregando pets...' : `${ownPets.length} pet(s) disponiveis`}
        </div>
      </div>

      <div className="mt-4 grid gap-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 ring-1 ring-slate-200">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={simulateResponsibleContactShareConsent}
            onChange={(event) =>
              onSimulateResponsibleContactShareConsentChange(event.target.checked)
            }
            className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
          />
          Criar simulacao com contato ja compartilhado
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={simulateAdopterContactShareConsent}
            onChange={(event) => onSimulateAdopterContactShareConsentChange(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
          />
          Adotante autoriza compartilhamento de contato
        </label>
      </div>
    </div>
  );
}
