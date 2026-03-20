import React from 'react';
import { petSpeciesOptions } from '@/Mocks/PetRegisterFormMock';

interface SidePanelProps {
  speciesCounts: Record<string, number>;
}

const SidePanel: React.FC<SidePanelProps> = ({ speciesCounts }) => {
  const speciesCards = petSpeciesOptions.map((speciesOption) => ({
    ...speciesOption,
    count: speciesCounts[speciesOption.value] ?? 0,
  }));

  return (
    <div
      className="
        sticky
        top-4
        h-fit
        p-6
        border-l
        border-gray-300
      "
    >
      {speciesCards.map((speciesCard) => (
        <div key={speciesCard.value} className="mb-6 bg-[#ddddff] last:mb-0">
          <p className="p-6 text-[1.2em] leading-[1.2]">
            Temos {speciesCard.count} {speciesCard.label.toLowerCase()}
            {speciesCard.count === 1 ? '' : 's'} cadastrados em nossa base.
          </p>
        </div>
      ))}
    </div>
  );
};

export default SidePanel;
