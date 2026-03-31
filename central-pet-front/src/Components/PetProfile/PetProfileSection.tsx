import type { ReactNode } from 'react';

interface PetProfileSectionProps {
  children: ReactNode;
  defaultOpen?: boolean;
  title: string;
}

const PetProfileSection = ({ children, defaultOpen = true, title }: PetProfileSectionProps) => (
  <details
    open={defaultOpen}
    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 lg:p-5"
  >
    <summary className="cursor-pointer list-none text-xl font-bold text-slate-900">{title}</summary>
    <div className="mt-4">{children}</div>
  </details>
);

export default PetProfileSection;
