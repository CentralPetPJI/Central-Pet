import dog from "../assets/image/dog.png";
import "./Header.css";
import DropdownMenu from "../Components/DropdownMenu";
import { Link } from "react-router-dom";

const Header = () => {
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
              { label: "Cadastrar", link: "" },
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
              { label: "Cadastro de Pet", link: "" },
              { label: "Sobre Nós", link: "/about" },
            ]}
          />
        </ul>
      </nav>
      <div className="auth">
        <>
          <a href="/register">Register</a>
          <a href="/login">Login</a>
        </>
      </div>
    </header>
  );
};

export default Header;
