import React, { useEffect, useRef } from "react";
import MobileMenuItem from "./MobileMenuItem";
import "./MobileMenu.css";

type MobileMenuProps = {
  isOpen: boolean;
  toggleMenu: () => void;
};

const menuItems = [
  { link: "/home", imgSrc: "/images/home.png", label: "Home" },
  { link: "/about", imgSrc: "/images/about.png", label: "About" },
  { link: "/services", imgSrc: "/images/services.png", label: "Services" },
  { link: "/contact", imgSrc: "/images/contact.png", label: "Contact" },
];

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, toggleMenu }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (isOpen) {
          toggleMenu();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, toggleMenu]);

  const handleItemClick = () => {
    toggleMenu();
  };

  return (
    <div ref={menuRef} className={`mobile-menu ${isOpen ? "open" : ""}`}>
      <ul className="mobile-nav-menu">
        {menuItems.map((item) => (
          <MobileMenuItem
            key={item.link}
            link={item.link}
            imgSrc={item.imgSrc}
            label={item.label}
            onClick={handleItemClick}
          />
        ))}
      </ul>
    </div>
  );
};

export default MobileMenu;
