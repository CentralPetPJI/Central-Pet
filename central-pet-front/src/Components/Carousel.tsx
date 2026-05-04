import React, { useMemo, useRef, useState } from 'react';
import type { Pet } from '@/Models/pet';
import PetModal from './PetModal.tsx';
import { formatState } from '@/lib/formatters';
import AutoScroll from 'embla-carousel-auto-scroll';
import type { CarouselApi } from '@/Components/ui/embla-carousel';
import {
  Carousel as UiCarousel,
  CarouselContent,
  CarouselItem,
} from '@/Components/ui/embla-carousel';

type CarouselProps = {
  petsData: Pet[];
};

const MIN_PETS_FOR_LOOP = 2;

const Carousel: React.FC<CarouselProps> = ({ petsData }) => {
  const apiRef = useRef<CarouselApi | null>(null);
  const autoScrollRef = useRef(
    AutoScroll({
      speed: 1.25,
      startDelay: 0,
      playOnInit: true,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  // Filtra somente pets disponíveis (sem mostrar indisponíveis no carrossel)
  const visiblePets = petsData.filter(
    (p) => (p.adoptionStatus ?? 'AVAILABLE') === 'AVAILABLE' && !(p.deleted ?? false),
  );

  const shouldLoop = visiblePets.length >= MIN_PETS_FOR_LOOP;
  const items = useMemo(() => visiblePets, [visiblePets]);

  return (
    <section className="w-full overflow-hidden px-6 py-8 select-none">
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">Ultimos Pets</h2>

      <UiCarousel
        className="w-full"
        opts={{
          align: 'start',
          loop: shouldLoop,
          slidesToScroll: 1,
          dragFree: true,
        }}
        plugins={shouldLoop ? [autoScrollRef.current] : []}
        setApi={(api) => {
          apiRef.current = api;
        }}
      >
        <CarouselContent className="pb-4">
          {items.map((pet) => (
            <CarouselItem key={pet.id} className="basis-auto">
              <div
                className="min-w-62.5 max-w-62.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition shrink-0 cursor-pointer"
                onClick={() => setSelectedPet(pet)}
              >
                <img
                  src={pet.photo}
                  alt={pet.name}
                  draggable={false}
                  className="h-48 w-full object-cover rounded-t-lg"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">{pet.name}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {pet.city
                      ? `${pet.city}${pet.state ? `/${formatState(pet.state)}` : ''}`
                      : 'Localizacao nao informada'}
                  </p>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                    {pet.physicalCharacteristics}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </UiCarousel>
      {selectedPet && <PetModal petData={selectedPet} onClick={() => setSelectedPet(null)} />}
    </section>
  );
};

export default Carousel;
