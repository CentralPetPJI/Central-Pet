import React from 'react';

// TODO: Acho que seria melhor passar um objeto com os counts ao invés de 3 props separadas, mas por enquanto tá ok assim
interface SidePanelProps {
  dogCount: number;
  catCount: number;
  otherCount: number;
}

const SidePanel: React.FC<SidePanelProps> = ({ dogCount, catCount, otherCount }) => {
  return (
    <div
      className="
        sticky
        top-[11vh]
        h-fit
        p-8
        border-l
        border-gray-300
      "
    >
      <div className="mb-12 bg-[#ddddff]">
        <p className="text-[1.2em] leading-[1.2] p-6">
          We have {dogCount} Dogs registered in our databases.
        </p>
      </div>

      <div className="mb-12 bg-[#ddddff]">
        <p className="text-[1.2em] leading-[1.2] p-6">
          We have {catCount} Cats registered in our databases.
        </p>
      </div>

      <div className="bg-[#ddddff]">
        <p className="text-[1.2em] leading-[1.2] p-6">
          We have {otherCount} pets of other species registered in our databases.
        </p>
      </div>
    </div>
  );
};

export default SidePanel;
