import dog from '../assets/image/dog.png';
import './Header.css';
import DropdownMenu from '../Components/DropdownMenu';
import { Link } from 'react-router-dom';
import { routes } from '@/routes';
import { useAuth } from '@/lib/auth';

const Header = () => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-300 bg-gradient-to-r from-[#6fe2f1] to-white">
      <div className="flex w-full flex-wrap items-center gap-3 px-3 py-3 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-4 lg:px-4">
        <div className="flex items-center gap-5 lg:gap-6 justify-self-start">
          <Link
            to={routes.home.path}
            className="flex items-center space-x-2 rounded-md transition hover:opacity-80"
          >
            <img src={dog} className="h-auto w-8 shrink-0" alt="Logo" />
            <p className="m-0 text-base font-medium">Pet Central</p>
          </Link>

          <nav className="hidden lg:block">
            <ul className="m-0 flex flex-wrap items-center gap-2 list-none p-0">
              <DropdownMenu title="Pets" items={['Procurar', 'Cadastrar']} />
              <DropdownMenu title="Instituições" items={['Consultar', 'Cadastrar Nova']} />
            </ul>
          </nav>
        </div>

        <nav className="order-3 w-full lg:hidden">
          <ul className="m-0 flex flex-wrap gap-2 list-none p-0">
            <DropdownMenu title="Pets" items={['Procurar', 'Cadastrar']} />
            <DropdownMenu title="Instituições" items={['Consultar', 'Cadastrar Nova']} />
          </ul>
        </nav>

        <div className="order-2 ml-auto flex flex-wrap items-center justify-end gap-2 lg:order-3">
          {currentUser ? (
            <>
              <span className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800">
                {currentUser.fullName}
              </span>
              <button
                type="button"
                onClick={() => {
                  void logout().finally(() => {
                    window.location.assign(routes.home.path);
                  });
                }}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 transition hover:bg-gray-100"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to={routes.register.path}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 transition hover:bg-gray-100"
              >
                Criar conta
              </Link>
              <Link
                to={routes.login.path}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 transition hover:bg-gray-100"
              >
                Entrar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
