import React, { useEffect, useRef, ReactNode, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import SidePanel from "./SidePanel";
import MobileMenu from "../Components/MobileMenu";
import "./Layout.css";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (headerRef.current) {
      const headerHeight = headerRef.current.clientHeight;
      document.documentElement.style.setProperty(
        "--header-height",
        `${headerHeight}`
      );
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="app-container">
      <div ref={headerRef}>
        <Header />
      </div>
      <div className="mobile-menu-container">
        <MobileMenu isOpen={isMenuOpen} toggleMenu={toggleMenu} />
        <button className="menu-toggle" onClick={toggleMenu}>
          ☰
        </button>
      </div>
      <main className="main-content">{children}</main>
      <SidePanel className="side-panel" />
      <Footer />
    </div>
  );
};

export default Layout;
