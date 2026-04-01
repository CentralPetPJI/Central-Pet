import type { ReactNode } from 'react';

export interface Pet {
  id: number;
  name: string;
  species: string;
  physicalCharacteristics: string;
  behavioralCharacteristics: string;
  notes: string;
  photo: string;
  responsibleUserId?: string;
  sourceType?: 'ONG' | 'PESSOA_FISICA';
  sourceName?: string;
}

export interface Photo {
  id: number;
  url: string;
  petId: number;
  note: string;
}

/**
 * MenuItem para navegação em dropdowns e menus
 * Suporta rotas, ações customizadas, ícones e controle de acesso
 */
export interface MenuItem {
  label?: string;
  path?: string;
  onClick?: () => void;
  icon?: ReactNode;
  badge?: number;
  disabled?: boolean;
  tooltip?: string;
  requiresAuth?: boolean;
  divider?: boolean;
}

/**
 * Props para componentes de navegação com active state
 */
export interface NavLinkProps {
  to: string;
  children: ReactNode;
  icon?: ReactNode;
  activeClassName?: string;
  className?: string;
  end?: boolean;
}
