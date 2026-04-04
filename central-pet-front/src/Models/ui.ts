import type { ReactNode } from 'react';

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

export interface NavLinkProps {
  to: string;
  children: ReactNode;
  icon?: ReactNode;
  activeClassName?: string;
  className?: string;
  end?: boolean;
}
