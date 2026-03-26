import React from 'react';

interface SelectableCardProps {
  children?: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  selectedLabel?: string;
  unselectedLabel?: string;
  title: string;
}

const SelectableCard: React.FC<SelectableCardProps> = ({
  description,
  icon,
  isSelected,
  onClick,
  selectedLabel = 'Selecionado',
  title,
  unselectedLabel = 'Selecionar',
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`group rounded-[1.5rem] border bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
      isSelected ? 'border-cyan-600 ring-2 ring-cyan-200' : 'border-cyan-200 hover:border-cyan-400'
    }`}
  >
    <div
      className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white transition ${
        isSelected ? 'bg-cyan-700' : 'bg-cyan-600 group-hover:bg-cyan-700'
      }`}
    >
      {icon}
    </div>
    <h2 className="mt-5 text-xl font-bold text-slate-900">{title}</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    <span
      className={`mt-5 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
        isSelected ? 'bg-cyan-700 text-white' : 'bg-cyan-50 text-cyan-700'
      }`}
    >
      {isSelected ? selectedLabel : unselectedLabel}
    </span>
  </button>
);

export default SelectableCard;
