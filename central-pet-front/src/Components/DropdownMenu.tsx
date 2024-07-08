import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./DropdownMenu.css";

type DropdownMenuProps = {
  title: string;
  items: { label: string; link: string }[];
};
const DropdownMenu: React.FC<DropdownMenuProps> = ({ title, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  return (
    <li
      ref={dropdownRef}
      className={`dropdown ${isOpen ? "open" : ""}`}
      onClick={toggleDropdown}
    >
      <a href="#">{title}</a>
      {isOpen && (
        <ul className="dropdown-menu">
          {items.map((item, index) => (
            <Link to={item.link} onClick={handleLinkClick}>
              <li key={index}>{item.label}</li>
            </Link>
          ))}
        </ul>
      )}
    </li>
  );
};

export default DropdownMenu;
