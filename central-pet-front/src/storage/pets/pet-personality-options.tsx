import type { ReactNode } from 'react';

export interface PetPersonalityOption {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
}

export const petPersonalityStorageKey = 'central-pet:selected-personalities';

const cardIconClassName = 'h-7 w-7';

export const petPersonalityOptions: PetPersonalityOption[] = [
  {
    id: 'playful',
    title: 'Brincalhao',
    description: 'Adora interagir, correr e transformar qualquer momento em diversao.',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={cardIconClassName}
      >
        <path d="M12 3v18" />
        <path d="M3 12h18" />
        <path d="M5.5 5.5l13 13" />
        <path d="M18.5 5.5l-13 13" />
      </svg>
    ),
  },
  {
    id: 'calm',
    title: 'Calmo',
    description: 'Prefere rotinas tranquilas, cochilos longos e ambientes serenos.',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={cardIconClassName}
      >
        <path d="M4 15c1.5 2.5 4.2 4 8 4s6.5-1.5 8-4" />
        <path d="M8 10c.5-.9 1.5-1.5 3-1.5s2.5.6 3 1.5" />
        <path d="M7 7h.01" />
        <path d="M17 7h.01" />
      </svg>
    ),
  },
  {
    id: 'protective',
    title: 'Protetor',
    description: 'Se apega rapido a familia e fica sempre atento ao redor.',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={cardIconClassName}
      >
        <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z" />
        <path d="M9.5 12.5l1.7 1.7 3.3-3.7" />
      </svg>
    ),
  },
  {
    id: 'curious',
    title: 'Curioso',
    description: 'Explora cantos novos, cheira tudo e gosta de novidades.',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={cardIconClassName}
      >
        <circle cx="11" cy="11" r="6" />
        <path d="m20 20-4.2-4.2" />
        <path d="M11 8v3l2 2" />
      </svg>
    ),
  },
  {
    id: 'independent',
    title: 'Independente',
    description: 'Gosta de autonomia e costuma decidir o proprio ritmo.',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={cardIconClassName}
      >
        <path d="M7 17 17 7" />
        <path d="M9 7h8v8" />
        <path d="M5 12v7h7" />
      </svg>
    ),
  },
  {
    id: 'friendly',
    title: 'Sociavel',
    description: 'Recebe bem visitas, outros pets e busca companhia com facilidade.',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={cardIconClassName}
      >
        <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
        <path d="M16 13a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
        <path d="M4 19c0-2.2 1.8-4 4-4" />
        <path d="M12 19c0-2.2 1.8-4 4-4" />
        <path d="M10 19c0-2.2 1.8-4 4-4" />
      </svg>
    ),
  },
];
