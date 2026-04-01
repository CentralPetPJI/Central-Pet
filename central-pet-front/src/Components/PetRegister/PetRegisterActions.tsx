import { Link } from 'react-router-dom';

interface PetRegisterActionsProps {
  isEditMode: boolean;
  latestPetPath: string;
  onSave: () => void;
  saveMessage: string;
  selectedPersonalitiesCount: number;
}

const PetRegisterActions = ({
  isEditMode,
  latestPetPath,
  onSave,
  saveMessage,
  selectedPersonalitiesCount,
}: PetRegisterActionsProps) => (
  <>
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
        {selectedPersonalitiesCount} selecionada(s)
      </span>
      <button
        type="button"
        onClick={onSave}
        className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        {isEditMode ? 'Salvar alteracoes' : 'Salvar pet'}
      </button>
      {latestPetPath ? (
        <Link
          to={latestPetPath}
          className="rounded-full border border-cyan-300 bg-white px-5 py-3 text-sm font-semibold text-cyan-700 transition hover:border-cyan-500 hover:bg-cyan-50"
        >
          Visualizar como pessoa física
        </Link>
      ) : (
        <button
          type="button"
          aria-disabled="true"
          disabled
          className="rounded-full border border-cyan-300 bg-white px-5 py-3 text-sm font-semibold text-cyan-700 opacity-50"
        >
          Visualizar como pessoa física
        </button>
      )}
    </div>

    {saveMessage ? (
      <p className="mt-3 text-sm font-medium text-emerald-700">{saveMessage}</p>
    ) : null}
  </>
);

export default PetRegisterActions;
