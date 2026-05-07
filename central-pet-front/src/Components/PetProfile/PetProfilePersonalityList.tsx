import { PersonalityTraitIcon, type PetPersonalityOption } from '@/storage/pets';
import PetProfileEmptyState from '@/Components/PetProfile/PetProfileEmptyState';

interface PetProfilePersonalityListProps {
  emptyMessage?: string;
  options: PetPersonalityOption[];
}

const PetProfilePersonalityList = ({
  emptyMessage = 'Nenhuma personalidade selecionada.',
  options,
}: PetProfilePersonalityListProps) => {
  if (options.length === 0) {
    return <PetProfileEmptyState message={emptyMessage} />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {options.map((option) => (
        <article key={option.id} className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white">
              <PersonalityTraitIcon iconSvg={option.iconSvg} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{option.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{option.description}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default PetProfilePersonalityList;
