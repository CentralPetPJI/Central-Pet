import { useState } from 'react';
import { Link } from 'react-router-dom';
import dog from '../assets/image/dog.png';
import DropdownMenu from '../Components/DropdownMenu';
import { NavLink } from '../Components/NavLink';
import { UserMenu } from '../Components/UserMenu';
import { useAuth } from '@/lib/auth-context';
import { routes } from '@/routes';
import { isDevelopment } from '@/lib/dev-mode';
import type { MenuItem } from '@/Models/Types';

const roleLabelMap = {
  ADOTANTE: 'Adotante',
  ONG: 'ONG',
  DOADOR_INDEPENDENTE: 'Doador independente',
} as const;

const Header = () => {
  const { currentUser, mockUsers, selectMockUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Define itens do menu "Pets"
  const petsMenuItems: MenuItem[] = [
    {
      label: 'Procurar',
      path: routes.home.path,
      icon: '🔍',
    },
    {
      label: 'Cadastrar',
      path: routes.pets.new.path,
      icon: '➕',
      requiresAuth: true,
    },
  ];

  // Define itens do menu "Instituições"
  const institutionsMenuItems: MenuItem[] = [
    {
      label: 'Consultar',
      disabled: true,
      tooltip: 'Em breve',
      icon: '🏢',
    },
    {
      label: 'Cadastrar Nova',
      disabled: true,
      tooltip: 'Em breve',
      icon: '➕',
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-300 bg-gradient-to-r from-[#6fe2f1] to-white">
      <div className="flex w-full items-center justify-between gap-3 px-3 py-3 lg:px-4">
        {/* Logo e Nome */}
        <Link
          to={routes.home.path}
          className="flex items-center space-x-2 rounded-md transition hover:opacity-80"
        >
          <img src={dog} className="h-auto w-8 shrink-0" alt="Logo" />
          <p className="m-0 text-base font-medium">Pet Central</p>
        </Link>

        {/* Navegação Desktop */}
        <nav className="hidden lg:flex items-center gap-2">
          <ul className="m-0 flex items-center gap-2 list-none p-0">
            <DropdownMenu title="Pets" items={petsMenuItems} />
            <DropdownMenu title="Instituições" items={institutionsMenuItems} />
          </ul>
        </nav>

        {/* Ações do Usuário - Desktop */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Mock User Selector (apenas em DEV) */}
          {isDevelopment() && (
            <label className="flex items-center gap-2 rounded-md border border-gray-300 bg-white/70 px-3 py-2 text-sm text-gray-800">
              <span className="hidden xl:inline">Usuario mock</span>
              <select
                aria-label="Selecionar usuario mock"
                className="min-w-36 bg-transparent outline-none"
                value={currentUser?.id ?? ''}
                onChange={(event) => {
                  void selectMockUser(event.target.value);
                }}
              >
                {mockUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} • {roleLabelMap[user.role]}
                  </option>
                ))}
              </select>
            </label>
          )}

          {/* Notificações (preparado, sem funcionalidade) */}
          {currentUser && (
            <button
              className="relative rounded-md border border-gray-300 bg-white/70 px-3 py-2 text-sm transition hover:bg-gray-100"
              aria-label="Notificações"
              disabled
              title="Em breve"
            >
              🔔
              {/* Badge de contador (exemplo) */}
              {/* <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                3
              </span> */}
            </button>
          )}

          {/* Menu do usuário OU botão de login */}
          {currentUser ? (
            <UserMenu />
          ) : (
            <Link
              to={routes.login.path}
              className="rounded-md border border-gray-300 bg-white/70 px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-100"
            >
              Entrar
            </Link>
          )}
        </div>

        {/* Botão de Menu Mobile */}
        <button
          className="lg:hidden rounded-md p-2 text-gray-800 hover:bg-gray-100"
          onClick={toggleMobileMenu}
          aria-label="Menu"
          aria-expanded={isMobileMenuOpen}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Menu Mobile (Slide) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-300 bg-white">
          <nav className="px-3 py-4">
            {/* Links de navegação */}
            <div className="space-y-2">
              <NavLink to={routes.home.path} end>
                🔍 Explorar Pets
              </NavLink>
              {currentUser && <NavLink to={routes.pets.new.path}>➕ Cadastrar Pet</NavLink>}
              <button
                className="w-full text-left rounded-md px-3 py-2 text-sm text-gray-800 opacity-50 cursor-not-allowed"
                disabled
                title="Em breve"
              >
                🏢 Instituições
              </button>
            </div>

            {/* Divider */}
            <hr className="my-4 border-gray-200" />

            {/* Ações do usuário */}
            {currentUser ? (
              <div className="space-y-2">
                <NavLink to={routes.pets.mine.path}>🐾 Meus Pets</NavLink>
                <NavLink to={routes.adoptionRequests.received.path}>📋 Solicitações</NavLink>
                <button
                  className="w-full text-left rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
                  onClick={() => {
                    // TODO: Implementar logout
                    setIsMobileMenuOpen(false);
                  }}
                >
                  🚪 Sair
                </button>
              </div>
            ) : (
              <Link
                to={routes.login.path}
                className="block rounded-md bg-blue-500 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Entrar
              </Link>
            )}

            {/* Mock User Selector Mobile (apenas em DEV) */}
            {isDevelopment() && (
              <>
                <hr className="my-4 border-gray-200" />
                <label className="block text-xs text-gray-600">
                  Usuario mock (DEV)
                  <select
                    className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    value={currentUser?.id ?? ''}
                    onChange={(event) => {
                      void selectMockUser(event.target.value);
                    }}
                  >
                    {mockUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName} • {roleLabelMap[user.role]}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
