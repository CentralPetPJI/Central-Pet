import React from "react";
import { Link } from "react-router-dom";
import "./MobileMenuItem.css";

interface MobileMenuItemProps {
  link: string;
  imgSrc: string;
  label: string;
  onClick: () => void;
}

const MobileMenuItem: React.FC<MobileMenuItemProps> = ({
  link,
  imgSrc,
  label,
  onClick,
}) => {
  return (
    <li className="mobile-menu-item" onClick={onClick}>
      <Link to={link}>
        <img src={imgSrc} alt={label} />
        <span>{label}</span>
      </Link>
    </li>
  );
};

export default MobileMenuItem;
