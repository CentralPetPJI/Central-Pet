interface PetProfileFact {
  label: string;
  value: string;
}

interface PetProfileFactGridProps {
  columnsClassName?: string;
  items: PetProfileFact[];
}

const PetProfileFactGrid = ({
  columnsClassName = 'sm:grid-cols-2 lg:grid-cols-3',
  items,
}: PetProfileFactGridProps) => (
  <div className={`grid gap-3 ${columnsClassName}`}>
    {items.map((item) => (
      <div key={item.label} className="rounded-2xl bg-white p-4">
        <p className="text-sm font-medium text-slate-500">{item.label}</p>
        <p className="mt-2 text-lg font-bold text-slate-900">{item.value}</p>
      </div>
    ))}
  </div>
);

export type { PetProfileFact };
export default PetProfileFactGrid;
