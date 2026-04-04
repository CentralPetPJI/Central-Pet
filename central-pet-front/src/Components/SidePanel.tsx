import React, { useEffect, useState } from 'react';
import { Cat, Dog, PawPrint, type LucideIcon } from 'lucide-react';
import { petSpeciesOptions } from '@/Mocks/PetRegisterFormMock';

interface SidePanelProps {
  speciesCounts: Record<string, number>;
}

const speciesIconByValue: Record<string, LucideIcon> = {
  dog: Dog,
  cat: Cat,
};

const SidePanel: React.FC<SidePanelProps> = ({ speciesCounts }) => {
  const speciesCards = petSpeciesOptions.map((speciesOption) => ({
    ...speciesOption,
    count: speciesCounts[speciesOption.value] ?? 0,
    icon: speciesIconByValue[speciesOption.value] ?? PawPrint,
  }));

  return (
    <div className="sticky top-4 flex h-fit flex-col gap-6 border-l border-gray-300 p-6">
      {speciesCards.map((speciesCard) => (
        <StatCard
          key={speciesCard.value}
          icon={speciesCard.icon}
          label={speciesCard.label}
          number={speciesCard.count}
        />
      ))}
    </div>
  );
};

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  number: number;
}

function StatCard({ icon: Icon, label, number }: StatCardProps) {
  const [count, setCount] = useState(0);
  const normalizedLabel = number === 1 ? `${label} cadastrado` : `${label}s cadastrados`;

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const increment = number / (duration / 16 || 1);

    const counter = window.setInterval(() => {
      start += increment;

      if (start >= number) {
        setCount(number);
        window.clearInterval(counter);
        return;
      }

      setCount(Math.floor(start));
    }, 16);

    return () => window.clearInterval(counter);
  }, [number]);

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-6 text-center shadow-xl transition-transform duration-300 hover:scale-105">
      <div className="mb-3 text-cyan-600">
        <Icon size={40} strokeWidth={1.8} />
      </div>
      <h2 className="text-4xl font-bold text-gray-800">{count}</h2>
      <p className="mt-2 text-gray-500">{normalizedLabel}</p>
    </div>
  );
}

export default SidePanel;
