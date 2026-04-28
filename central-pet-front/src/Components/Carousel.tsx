import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Pet } from '@/Models/pet';
import PetModal from './PetModal.tsx';
import { formatState } from '@/lib/formatters';

type CarouselProps = {
  petsData: Pet[];
};

// Velocidade alvo do auto-scroll em pixels/segundo para manter consistencia entre diferentes taxas de refresh.
const AUTO_SCROLL_PX_PER_SECOND = 60;
const MIN_PETS_FOR_LOOP = 3;

const Carousel: React.FC<CarouselProps> = ({ petsData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const isPaused = useRef(false);
  const isDraggingRef = useRef(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  // Estados para controle de Drag (arrastar)
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  const shouldLoop = petsData.length >= MIN_PETS_FOR_LOOP;
  const items = shouldLoop ? [...petsData, ...petsData] : petsData;

  const handleLoop = useCallback(() => {
    if (!shouldLoop) return;
    const container = containerRef.current;
    if (!container) return;

    const halfWidth = container.scrollWidth / 2;
    if (halfWidth === 0) return;

    /* TODO(UX): Hoje o loop normaliza para [0, halfWidth), o que quebra a continuidade ao arrastar para a esquerda.
     Intencao atual de produto: manter loop infinito apenas para a direita; revisar com UX se esse comportamento deve mudar.
    */
    if (container.scrollLeft >= halfWidth || container.scrollLeft <= 0) {
      container.scrollLeft = ((container.scrollLeft % halfWidth) + halfWidth) % halfWidth;
    }
  }, [shouldLoop]);

  const startAutoScroll = useCallback(() => {
    if (!shouldLoop) return;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    isPaused.current = false;
    let lastTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (isPaused.current || isDraggingRef.current) return;
      if (containerRef.current) {
        if (lastTimestamp === null) {
          lastTimestamp = timestamp;
        }
        const deltaMs = Math.min(timestamp - lastTimestamp, 64);
        lastTimestamp = timestamp;
        containerRef.current.scrollLeft += (AUTO_SCROLL_PX_PER_SECOND * deltaMs) / 1000;
        handleLoop();
      }
      animationRef.current = requestAnimationFrame(step);
    };
    animationRef.current = requestAnimationFrame(step);
  }, [handleLoop, shouldLoop]);

  const stopAutoScroll = useCallback(() => {
    isPaused.current = true;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDraggingRef.current || !containerRef.current) return;

      const { left } = containerRef.current.getBoundingClientRect();
      const x = clientX - left;
      const walk = (x - startX.current) * 1.5; // Multiplicador de velocidade do arrasto
      containerRef.current.scrollLeft = scrollLeftStart.current - walk;
      handleLoop(); // Garante o loop enquanto arrasta
    },
    [handleLoop],
  );

  const startDragging = useCallback(
    (clientX: number) => {
      isDraggingRef.current = true;
      setIsDragging(true);
      stopAutoScroll();
      const left = containerRef.current?.getBoundingClientRect().left || 0;
      startX.current = clientX - left;
      scrollLeftStart.current = containerRef.current?.scrollLeft || 0;
    },
    [stopAutoScroll],
  );

  const stopDragging = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
    }
    const isHovering = containerRef.current?.matches(':hover');
    if (!isHovering) {
      startAutoScroll();
    }
  }, [startAutoScroll]);

  // Lógica de Mouse Drag
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startDragging(e.clientX);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    startDragging(touch.clientX);
  };

  const onMouseLeave = () => {
    if (!isDraggingRef.current) {
      startAutoScroll();
    }
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!shouldLoop) {
      container.scrollLeft = 0;
      return;
    }

    // Start at the duplicated midpoint so the first visible frame is stable
    // and users can drag backward without immediately hitting the loop boundary.
    container.scrollLeft = container.scrollWidth / 2;
  }, [petsData.length, shouldLoop]);

  useEffect(() => {
    if (!shouldLoop) {
      stopAutoScroll();
      return;
    }

    startAutoScroll();
    return () => stopAutoScroll();
  }, [shouldLoop, startAutoScroll, stopAutoScroll]);

  useEffect(() => {
    if (!isDragging) return;

    const handleDocumentMouseMove = (event: MouseEvent) => {
      event.preventDefault();
      handleDragMove(event.clientX);
    };

    const handleDocumentMouseUp = () => {
      stopDragging();
    };

    const handleDocumentTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      if (event.cancelable) {
        event.preventDefault();
      }
      handleDragMove(touch.clientX);
    };

    const handleDocumentTouchEnd = () => {
      stopDragging();
    };

    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);
    document.addEventListener('touchmove', handleDocumentTouchMove, { passive: false });
    document.addEventListener('touchend', handleDocumentTouchEnd);
    document.addEventListener('touchcancel', handleDocumentTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
      document.removeEventListener('touchmove', handleDocumentTouchMove);
      document.removeEventListener('touchend', handleDocumentTouchEnd);
      document.removeEventListener('touchcancel', handleDocumentTouchEnd);
    };
  }, [handleDragMove, isDragging, stopDragging]);

  return (
    <section className="w-full overflow-hidden px-6 py-8 select-none">
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">Ultimos Pets</h2>

      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onMouseEnter={stopAutoScroll}
        onMouseLeave={onMouseLeave}
        className={`flex gap-6 overflow-x-hidden pb-4 cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
      >
        {items.map((pet, idx) => {
          const originalPet = shouldLoop ? petsData[idx % petsData.length] : pet;

          return (
            <div
              key={`${pet.id}-${idx}`}
              className="min-w-[250px] max-w-[250px] bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition shrink-0 cursor-pointer"
              onClick={() => setSelectedPet(originalPet)}
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
          );
        })}
      </div>
      {selectedPet && <PetModal petData={selectedPet} onClick={() => setSelectedPet(null)} />}
    </section>
  );
};

export default Carousel;
