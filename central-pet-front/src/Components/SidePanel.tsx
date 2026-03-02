import { Dog, Cat, PawPrint } from 'lucide-react';
import { useEffect, useState } from 'react';
import React from "react";

// TODO: Acho que seria melhor passar um objeto com os counts ao invés de 3 props separadas, mas por enquanto tá ok assim
interface SidePanelProps {
  counts: {
    dog: number;
    cat: number;
    other: number;
  };
}

export const SidePanel: React.FC<SidePanelProps> = ({ counts }) => {
  const { dog, cat, other } = counts;

  return (
    <div className="flex flex-col gap-12 px-10">
      <StatCard icon={<Dog size={40} />} number={dog} label="Cachorros Registrados" />
      <StatCard icon={<Cat size={40} />} number={cat} label="Gatos Registrados" />
      <StatCard icon={<PawPrint size={40} />} number={other} label="Outros Animais Registrados" />
    </div>
  );
};
interface StatCardProps {
  icon: React.ReactNode;
  number: number;
  label: string;
}
function StatCard({ number, label, icon }: StatCardProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 800; // duração animação
    const increment = number / (duration / 16); // frames da animação

    const counter = setInterval(() => {
      start += increment;

      if (start >= number) {
        setCount(number);
        clearInterval(counter);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(counter);
  }, [number]); // atualiza automaticamente quando pets mudar

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center hover:scale-105 transition-transform duration-300">
      <div className="text-purple-600 mb-3">{icon}</div>

      <h2 className="text-4xl font-bold text-gray-800">{count}</h2>

      <p className="text-gray-500 mt-2 text-center">{label}</p>
    </div>
  );
}
export default SidePanel;
