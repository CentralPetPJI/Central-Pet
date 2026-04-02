import { useState, useEffect, useRef } from 'react';
import { ClipboardList, DoorOpen, PawPrint, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { routes } from '@/routes';
import type { MenuItem } from '@/Models/Types';

/**
 * UserMenu - Dropdown do usuário logado com avatar e opções
 * Mostra nome, avatar com iniciais, e menu de ações do usuário
 */
export function UserMenu() {
  const { currentUser, clearAuth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  // Extrai iniciais do nome (ex: "João Silva" -> "JS")
  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(currentUser.fullName);

  // Define opções do menu
  const menuItems: MenuItem[] = [
    {
      label: 'Meus Pets',
      path: routes.pets.mine.path,
      icon: <PawPrint className="h-4 w-4 text-cyan-700" />,
    },
    {
      label: 'Solicitações',
      path: routes.adoptionRequests.received.path,
      icon: <ClipboardList className="h-4 w-4 text-cyan-700" />,
      // TODO: Conectar com API para pegar contador real
      // badge: pendingRequestsCount,
    },
    {
      label: 'Perfil',
      // TODO: Criar rota de perfil
      disabled: true,
      tooltip: 'Em breve',
      icon: <UserRound className="h-4 w-4 text-slate-500" />,
    },
    {
      divider: true,
    },
    {
      label: 'Sair',
      onClick: () => {
        clearAuth();
        setIsOpen(false);
      },
      icon: <DoorOpen className="h-4 w-4 text-rose-500" />,
    },
  ];

  const handleItemClick = (item: MenuItem) => {
    if (item.disabled) return;
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 rounded-md border border-gray-300 bg-white/70 px-3 py-2 text-sm transition hover:bg-gray-100"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Menu do usuário"
      >
        {/* Avatar com iniciais */}
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-bold text-white">
          {initials}
        </div>

        {/* Nome do usuário (oculto em telas pequenas) */}
        <span className="hidden md:inline">{currentUser.fullName}</span>

        {/* Ícone de seta */}
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <ul
          className="absolute right-0 top-full z-20 mt-1 w-48 rounded-md border border-gray-300 bg-white shadow-lg list-none p-0"
          role="menu"
        >
          {/* Header do menu com info do usuário */}
          <li className="border-b border-gray-200 px-4 py-3">
            <p className="font-medium text-gray-900">{currentUser.fullName}</p>
            <p className="text-xs text-gray-500">{currentUser.email}</p>
          </li>

          {/* Itens do menu */}
          {menuItems.map((item, index) => {
            // Divider
            if (item.divider) {
              return <li key={index} className="my-1 border-t border-gray-200" role="separator" />;
            }

            const itemContent = (
              <>
                {item.icon && <span className="mr-2 inline-flex">{item.icon}</span>}
                {item.label}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                    {item.badge}
                  </span>
                )}
              </>
            );

            const itemClassName = `flex w-full items-center px-4 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 ${
              item.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            }`;

            return (
              <li key={index} role="menuitem" title={item.tooltip}>
                {item.path && !item.disabled ? (
                  <Link
                    to={item.path}
                    className={itemClassName}
                    onClick={() => handleItemClick(item)}
                  >
                    {itemContent}
                  </Link>
                ) : (
                  <button
                    className={itemClassName}
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                  >
                    {itemContent}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
