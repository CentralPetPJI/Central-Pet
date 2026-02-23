import React, { useState, useEffect, useRef } from 'react';

type DropdownMenuProps = {
  title: string;
  items: string[];
};

const DropdownMenu: React.FC<DropdownMenuProps> = ({ title, items }) => {
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

  return (
    <li ref={dropdownRef} className="relative" onClick={toggleDropdown}>
      <button className="px-2 py-1 text-gray-800 hover:bg-gray-100 rounded-md transition">
        {title}
      </button>

      {isOpen && (
        <ul className="absolute top-full left-0 mt-1 w-max bg-white border border-gray-300 rounded-md shadow-lg list-none p-0">
          {items.map((item, index) => (
            <li key={index} className="px-4 py-2 hover:bg-green-200 whitespace-nowrap">
              <a href="#" className="text-gray-800">
                {item}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default DropdownMenu;
