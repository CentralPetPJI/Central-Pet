import React, { useEffect, useRef } from 'react';
import { Pet } from '../Models/Types';

type CarouselProps = {
  petsData: Pet[];
};

const CARD_WIDTH = 250;
const GAP = 24;
const ITEM_SIZE = CARD_WIDTH + GAP;

const Carousel: React.FC<CarouselProps> = ({ petsData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const items = [...petsData, ...petsData];

  // TODO: Acho que seria melhor usar requestAnimationFrame ao invés de setInterval, mas por enquanto tá ok assim
  // TODO: Não está voltando para o meio quando chega no final, tem que dar um scrollLeft a mais para voltar, mas por enquanto tá ok assim
  const startAutoScroll = () => {
    stopAutoScroll();

    intervalRef.current = setInterval(() => {
      const container = containerRef.current;
      if (!container) return;

      container.scrollLeft += 1;
    }, 20);
  };

  const stopAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // começa no meio
    container.scrollLeft = petsData.length * ITEM_SIZE;

    startAutoScroll();

    const handleScroll = () => {
      const maxScroll = petsData.length * ITEM_SIZE * 2;

      // loop invisível
      if (container.scrollLeft >= maxScroll - ITEM_SIZE) {
        container.scrollLeft = petsData.length * ITEM_SIZE;
      }

      if (container.scrollLeft <= ITEM_SIZE) {
        container.scrollLeft = petsData.length * ITEM_SIZE;
      }
    };

    container.addEventListener('scroll', handleScroll);
    container.addEventListener('mouseenter', stopAutoScroll);
    container.addEventListener('mouseleave', startAutoScroll);
    container.addEventListener('touchstart', stopAutoScroll);
    container.addEventListener('touchend', startAutoScroll);

    return () => {
      stopAutoScroll();
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('mouseenter', stopAutoScroll);
      container.removeEventListener('mouseleave', startAutoScroll);
      container.removeEventListener('touchstart', stopAutoScroll);
      container.removeEventListener('touchend', startAutoScroll);
    };
  }, [petsData.length]);

  return (
    <section className="w-full overflow-hidden px-6 py-8">
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">Latest Pets</h2>

      <div
        ref={containerRef}
        className="
          flex
          gap-6
          overflow-x-auto
          pb-4
          scroll-smooth
        "
      >
        {items.map((pet) => (
          <div
            key={pet.id}
            className="
              min-w-62.5
              max-w-62.5
              bg-white
              border
              border-gray-200
              rounded-lg
              shadow-sm
              hover:shadow-md
              transition
              shrink-0
            "
          >
            <img src={pet.photo} alt={pet.name} className="h-48 w-full object-cover rounded-t-lg" />

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">{pet.name}</h3>

              <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                {pet.physicalCharacteristics}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Carousel;
