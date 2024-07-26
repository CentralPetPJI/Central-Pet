import { useContext } from "react";
import dog from "../assets/image/dog.png";
import "./Header.css";
import DropdownMenu from "../Components/DropdownMenu";
import { Link } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";

const Header = () => {
  const authContext = useContext(AuthContext);
  const { user, logout } = authContext || {};

  if (!authContext) {
    return null;
  }

  return (
    <header className="header">
      <Link to="/" className="logoLink">
        <div className="logo">
          <img src={dog} />
          <p>Central Pet</p>
        </div>
      </Link>
      <nav className="nav">
        <ul className="nav-menu">
          <DropdownMenu
            title="Pets"
            items={[
              { label: "Procurar", link: "" },
              { label: "Cadastrar", link: "/pets/register" },
              { label: "Solicitações", link: "" },
            ]}
          />
          <DropdownMenu
            title="Instituições"
            items={[{ label: "Consultar", link: "" }]}
          />
          <DropdownMenu
            title="Ajuda"
            items={[
              {
                label: "Cadastro de Pet",
                link: "/instructions",
              },
              { label: "Sobre Nós", link: "/about" },
            ]}
          />
        </ul>
      </nav>
      {!user ? (
        <div className="auth">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      ) : (
        <div className="auth">
          <label className="auth-user-label">Olá {user.username}</label>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </header>
  );
};

export default Header;
