interface PetProfileEmptyStateProps {
  message: string;
}

const PetProfileEmptyState = ({ message }: PetProfileEmptyStateProps) => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5">
    <p className="text-sm text-slate-600">{message}</p>
  </div>
);

export default PetProfileEmptyState;
