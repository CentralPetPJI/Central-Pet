import React, { useEffect, useRef, ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import SidePanel from "./SidePanel";
import "./Layout.css";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      const headerHeight = headerRef.current.clientHeight;
      document.documentElement.style.setProperty(
        "--header-height",
        `${headerHeight}`
      );
    }
  }, []);

  return (
    <div className="app-container">
      <div ref={headerRef}>
        <Header />
      </div>
      <main className="main-content">{children}</main>
      <SidePanel className="side-panel" />
      <Footer />
    </div>
  );
};

export default Layout;
