import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { MenuItem } from '@/Models/Types';

type DropdownMenuProps = {
  title: string;
  items: MenuItem[];
  icon?: React.ReactNode;
  buttonClassName?: string;
};

/**
 * Menu dropdown com navegação real e suporte a ações customizadas
 * Suporta rotas, ícones, badges, tooltips e itens desabilitados
 */
const DropdownMenu: React.FC<DropdownMenuProps> = ({
  title,
  items,
  icon,
  buttonClassName = 'rounded-md px-3 py-2 text-sm text-gray-800 transition hover:bg-gray-100',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item: MenuItem) => {
    if (item.disabled) return;
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  return (
    <li ref={dropdownRef} className="relative">
      <button
        className={buttonClassName}
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {icon && <span className="mr-2 inline-block">{icon}</span>}
        {title}
      </button>

      {isOpen && (
        <ul
          className="absolute left-0 top-full z-20 mt-1 w-max rounded-md border border-gray-300 bg-white p-0 shadow-lg list-none"
          role="menu"
        >
          {items.map((item, index) => {
            // Divider (separador visual)
            if (item.divider) {
              return <li key={index} className="my-1 border-t border-gray-200" role="separator" />;
            }

            const itemContent = (
              <>
                {item.icon && <span className="mr-2 inline-block">{item.icon}</span>}
                {item.label}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                    {item.badge}
                  </span>
                )}
              </>
            );

            const itemClassName = `block px-4 py-2 hover:bg-green-200 whitespace-nowrap ${
              item.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            }`;

            return (
              <li
                key={index}
                role="menuitem"
                title={item.tooltip}
                className={item.disabled ? 'cursor-not-allowed' : ''}
              >
                {item.path && !item.disabled ? (
                  <Link to={item.path} className={itemClassName} onClick={() => setIsOpen(false)}>
                    {itemContent}
                  </Link>
                ) : (
                  <button
                    className={`${itemClassName} w-full text-left text-gray-800`}
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                  >
                    {itemContent}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};

export default DropdownMenu;
