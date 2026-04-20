import { useState, useLayoutEffect, useRef } from 'react';
import { Bell, Building2, ClipboardList, Compass, Plus, Search, PawPrint } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import dog from '../assets/image/dog.png';
import DropdownMenu from '../Components/DropdownMenu';
import { NavLink } from '../Components/NavLink';
import { UserMenu } from '../Components/UserMenu';
import { useAuth } from '@/lib/auth-context';
import { routes } from '@/routes';
import { shouldDisplayMockUsers } from '@/lib/dev-mode';
import type { MenuItem } from '@/Models/ui';

const roleLabelMap = {
  PESSOA_FISICA: 'Pessoa física',
  ONG: 'ONG',
} as const;

const Header = () => {
  const { currentUser, users, selectUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Fecha o menu mobile quando a rota muda
  // Usa uma ref para rastrear a rota e atualizar o estado de forma condicional
  const locationRef = useRef(location);

  useLayoutEffect(() => {
    if (locationRef.current.pathname !== location.pathname) {
      // Este é um caso legítimo: fechar a interface ao navegar
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMobileMenuOpen(false);
      locationRef.current = location;
    }
  }, [location]);

  // Define itens do menu "Pets"
  const petsMenuItems: MenuItem[] = [
    {
      label: 'Procurar',
      path: routes.home.path,
      icon: <Search className="h-4 w-4 text-cyan-700" />,
    },
    {
      label: 'Cadastrar',
      path: routes.pets.new.path,
      icon: <Plus className="h-4 w-4 text-emerald-600" />,
      requiresAuth: true,
    },
  ];

  // Define itens do menu "Instituições"
  const institutionsMenuItems: MenuItem[] = [
    {
      label: 'Consultar',
      disabled: true,
      tooltip: 'Em breve',
      icon: <Compass className="h-4 w-4 text-amber-600" />,
    },
    {
      label: 'Cadastrar Nova',
      disabled: true,
      tooltip: 'Em breve',
      icon: <Building2 className="h-4 w-4 text-amber-600" />,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-300 bg-gradient-to-r from-[#6fe2f1] to-white">
      <div className="flex w-full items-center gap-3 px-3 py-3 lg:px-4">
        {/* Lado Esquerdo: Logo + Navegação */}
        <div className="flex items-center gap-4">
          {/* Logo e Nome */}
          <Link
            to={routes.home.path}
            className="flex items-center space-x-2 rounded-md transition hover:opacity-80"
          >
            <img src={dog} className="h-auto w-8 shrink-0" alt="Logo" />
            <p className="m-0 text-base font-medium">Pet Central</p>
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden lg:block">
            <ul className="m-0 flex items-center gap-2 list-none p-0">
              <DropdownMenu
                title="Pets"
                items={petsMenuItems}
                icon={<PawPrint className="h-4 w-4 text-cyan-700" />}
              />
              <DropdownMenu
                title="Instituições"
                items={institutionsMenuItems}
                icon={<Building2 className="h-4 w-4 text-amber-600" />}
              />
            </ul>
          </nav>
        </div>

        {/* Espaço flexível no meio */}
        <div className="hidden lg:flex flex-1" />

        {/* Ações do Usuário - Desktop */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Seletor de usuário (apenas em DEV) */}
          {shouldDisplayMockUsers() && (
            <label className="flex items-center gap-2 rounded-md border border-gray-300 bg-white/70 px-3 py-2 text-sm text-gray-800">
              <span className="hidden xl:inline">Usuario</span>
              <select
                aria-label="Selecionar usuario"
                className="min-w-36 bg-transparent outline-none"
                value={currentUser?.id ?? ''}
                onChange={(event) => {
                  void selectUser(event.target.value);
                }}
              >
                <option value="" disabled>
                  Selecionar perfil
                </option>
                {users.map((user) => (
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
              <Bell className="h-5 w-5 text-amber-500" />
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
          className="ml-auto lg:hidden rounded-md p-2 text-gray-800 hover:bg-gray-100"
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
                <span className="inline-flex items-center gap-2">
                  <Search className="h-4 w-4 text-cyan-700" />
                  <span>Explorar Pets</span>
                </span>
              </NavLink>
              {currentUser && (
                <NavLink to={routes.pets.new.path}>
                  <span className="inline-flex items-center gap-2">
                    <Plus className="h-4 w-4 text-emerald-600" />
                    <span>Cadastrar Pet</span>
                  </span>
                </NavLink>
              )}
              <button
                className="w-full text-left rounded-md px-3 py-2 text-sm text-gray-800 opacity-50 cursor-not-allowed"
                disabled
                title="Em breve"
              >
                <span className="inline-flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-600" />
                  <span>Instituições</span>
                </span>
              </button>
            </div>

            {/* Divisor */}
            <hr className="my-4 border-gray-200" />

            {/* Ações do usuário */}
            {currentUser ? (
              <div className="space-y-2">
                <NavLink to={routes.pets.mine.path}>🐾 Meus Pets</NavLink>
                <NavLink to={routes.adoptionRequests.received.path}>
                  <span className="inline-flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-cyan-700" />
                    <span>Solicitações</span>
                  </span>
                </NavLink>
                <button
                  className="w-full text-left rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
                  onClick={() => {
                    void logout();
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

            {/* Seletor de usuário no mobile (apenas em DEV) */}
            {shouldDisplayMockUsers() && (
              <>
                <hr className="my-4 border-gray-200" />
                <label className="block text-xs text-gray-600">
                  Usuario mock (DEV)
                  <select
                    className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    value={currentUser?.id ?? ''}
                    onChange={(event) => {
                      void selectUser(event.target.value);
                    }}
                  >
                    <option value="" disabled>
                      Selecionar perfil
                    </option>
                    {users.map((user) => (
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
