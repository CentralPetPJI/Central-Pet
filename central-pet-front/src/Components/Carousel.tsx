import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Pet } from '../Models/Types';

type CarouselProps = {
  petsData: Pet[];
};

const Carousel: React.FC<CarouselProps> = ({ petsData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const isPaused = useRef(false);

  // Estados para controle de Drag (arrastar)
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  // Duplicamos apenas 1x (Total: 2 conjuntos de dados)
  // TODO: Pensar em uma solução mais elegante para evitar duplicação de chaves (id) e garantir unicidade
  const items = [...petsData, ...petsData];

  const handleLoop = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const halfWidth = container.scrollWidth / 2;

    // Se chegar no final da segunda cópia, pula pro início da primeira
    if (container.scrollLeft >= halfWidth) {
      container.scrollLeft -= halfWidth;
    }
    // Se arrastar para trás e chegar antes do início, pula para a segunda cópia
    else if (container.scrollLeft <= 0) {
      container.scrollLeft += halfWidth;
    }
  }, []);

  const startAutoScroll = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    isPaused.current = false;

    const step = () => {
      if (isPaused.current || isDragging) return;
      if (containerRef.current) {
        containerRef.current.scrollLeft += 1;
        handleLoop();
      }
      animationRef.current = requestAnimationFrame(step);
    };
    animationRef.current = requestAnimationFrame(step);
  }, [handleLoop, isDragging]);

  const stopAutoScroll = useCallback(() => {
    isPaused.current = true;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  }, []);

  // Lógica de Mouse Drag
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    stopAutoScroll();
    startX.current = e.pageX - (containerRef.current?.offsetLeft || 0);
    scrollLeftStart.current = containerRef.current?.scrollLeft || 0;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current.offsetLeft || 0);
    const walk = (x - startX.current) * 1.5; // Multiplicador de velocidade do arrasto
    containerRef.current.scrollLeft = scrollLeftStart.current - walk;
    handleLoop(); // Garante o loop enquanto arrasta
  };

  const stopDragging = () => {
    setIsDragging(false);
    startAutoScroll();
  };

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [startAutoScroll, stopAutoScroll]);

  return (
    <section className="w-full overflow-hidden px-6 py-8 select-none">
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">Latest Pets</h2>

      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        onMouseEnter={stopAutoScroll}
        className={`flex gap-6 overflow-x-hidden pb-4 cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
      >
        {items.map((pet, idx) => (
          <div
            key={`${pet.id}-${idx}`}
            className="min-w-[250px] max-w-[250px] bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition shrink-0 pointer-events-none"
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
