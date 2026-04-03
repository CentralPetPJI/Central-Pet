import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  buttonClassName = 'rounded-md px-4 py-2 text-base font-medium text-gray-800 transition hover:bg-gray-100',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const menuItemRefs = useRef<(HTMLElement | null)[]>([]);

  // Compute stable mapping from item indices to non-divider positions
  const nonDividerIndices = useMemo(() => {
    const mapping = new Map<number, number>();
    let nonDividerCounter = 0;
    items.forEach((item, index) => {
      if (!item.divider) {
        mapping.set(index, nonDividerCounter++);
      }
    });
    return mapping;
  }, [items]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) return;

    const nonDividerItems = items.filter((item) => !item.divider);

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev + 1 >= nonDividerItems.length ? 0 : prev + 1;
          menuItemRefs.current[next]?.focus();
          return next;
        });
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev <= 0 ? nonDividerItems.length - 1 : prev - 1;
          menuItemRefs.current[next]?.focus();
          return next;
        });
        break;
      }
      case 'Home': {
        event.preventDefault();
        setFocusedIndex(0);
        menuItemRefs.current[0]?.focus();
        break;
      }
      case 'End': {
        event.preventDefault();
        const lastIndex = nonDividerItems.length - 1;
        setFocusedIndex(lastIndex);
        menuItemRefs.current[lastIndex]?.focus();
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        if (focusedIndex >= 0 && menuItemRefs.current[focusedIndex]) {
          const item = nonDividerItems[focusedIndex];
          if (item && !item.disabled) {
            const element = menuItemRefs.current[focusedIndex];
            if (element) {
              element.click();
            } else if (item.onClick) {
              item.onClick();
            }
            closeMenu();
          }
        }
        break;
      }
      case 'Escape': {
        event.preventDefault();
        closeMenu();
        break;
      }
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
    closeMenu();
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
          className="absolute left-0 top-full z-20 mt-1 w-max min-w-56 rounded-md border border-gray-300 bg-white p-0 shadow-lg list-none"
          role="menu"
          onKeyDown={handleKeyDown}
        >
          {items.map((item, index) => {
            // Divider (separador visual)
            if (item.divider) {
              return <li key={index} className="my-1 border-t border-gray-200" role="separator" />;
            }

            const nonDividerIndex = nonDividerIndices.get(index);

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

            const itemClassName = `block px-4 py-3 text-base leading-6 hover:bg-green-200 whitespace-nowrap ${
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
                  <Link
                    to={item.path}
                    className={itemClassName}
                    onClick={() => closeMenu()}
                    ref={(el) => {
                      if (nonDividerIndex !== undefined) {
                        menuItemRefs.current[nonDividerIndex] = el;
                      }
                    }}
                  >
                    {itemContent}
                  </Link>
                ) : (
                  <button
                    className={`${itemClassName} w-full text-left text-gray-800`}
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                    ref={(el) => {
                      if (nonDividerIndex !== undefined) {
                        menuItemRefs.current[nonDividerIndex] = el;
                      }
                    }}
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
