import { Link, useLocation } from 'react-router-dom';
import type { NavLinkProps } from '@/Models/ui';

/**
 * Link de navegação com detecção automática de rota ativa
 * Adiciona destaque visual quando a rota atual corresponde ao link
 */
export function NavLink({
  to,
  children,
  icon,
  activeClassName = 'bg-gray-100 font-medium',
  className = 'rounded-md px-3 py-2 text-sm text-gray-800 transition hover:bg-gray-100',
  end = false,
}: NavLinkProps) {
  const location = useLocation();

  // Verifica se a rota está ativa
  const isActive = end ? location.pathname === to : location.pathname.startsWith(to);

  const finalClassName = isActive ? `${className} ${activeClassName}` : className;

  return (
    <Link to={to} className={finalClassName} aria-current={isActive ? 'page' : undefined}>
      {icon && <span className="mr-2 inline-block">{icon}</span>}
      {children}
    </Link>
  );
}
