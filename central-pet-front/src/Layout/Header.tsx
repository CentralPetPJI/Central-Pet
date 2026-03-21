import { Link } from 'react-router-dom';
import dog from '../assets/image/dog.png';
import './Header.css';
import DropdownMenu from '../Components/DropdownMenu';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full h-[8vh] max-h-[10%] grid grid-cols-[auto_1fr_auto] items-center justify-between border-b border-gray-300 bg-gradient-to-r from-[#6fe2f1] to-white px-4">
      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2 no-underline text-inherit">
        <img src={dog} className="w-8 h-auto" alt="Logo" />
        <p className="m-0 text-base">Pet Central</p>
      </Link>

      {/* Nav */}
      <nav className="ml-12">
        <ul className="flex space-x-6 list-none p-0 m-0">
          <DropdownMenu title="Pets" items={['Procurar', 'Cadastrar']} />
          <DropdownMenu title="Instituições" items={['Consultar', 'Cadastrar Nova']} />
        </ul>
      </nav>

      {/* Botões de Ação - Alterados de <a> para <Link> */}
      <div className="flex items-center space-x-4 mr-2">
        
        {/* <a href="/register" className="px-2 py-1 border border-gray-300 rounded-md text-gray-800 hover:bg-gray-100 transition">Register</a> */}
        {/* <a href="/login" className="px-2 py-1 border border-gray-300 rounded-md text-gray-800 hover:bg-gray-100 transition">Login</a> */}

        <Link to="/register" className="px-2 py-1 border border-gray-300 rounded-md text-gray-800 hover:bg-gray-100 transition no-underline">Register</Link>
        <Link to="/login" className="px-2 py-1 border border-gray-300 rounded-md text-gray-800 hover:bg-gray-100 transition no-underline">Login</Link>
      </div>
    </header>
  );
};

export default Header;
