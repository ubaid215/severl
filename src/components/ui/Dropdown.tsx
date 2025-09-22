'use client';

import { Fragment, ReactNode, useState, useRef, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDown, LucideIcon } from 'lucide-react';

export interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  disabled?: boolean;
  divider?: boolean;
  className?: string;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
  triggerClassName?: string;
}

export default function Dropdown({
  trigger,
  items,
  align = 'right',
  className = '',
  triggerClassName = '',
}: DropdownProps) {
  return (
    <Menu as="div" className={`relative inline-block text-left ${className}`}>
      <Menu.Button className={`flex items-center focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded-lg ${triggerClassName}`}>
        {trigger}
        <ChevronDown className="ml-1 h-4 w-4" aria-hidden="true" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`absolute z-50 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:border-gray-700 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className="py-1">
            {items.map((item, index) => (
              <Fragment key={index}>
                {item.divider ? (
                  <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
                ) : (
                  <Menu.Item disabled={item.disabled}>
                    {({ active }) => (
                      <button
                        onClick={item.onClick}
                        disabled={item.disabled}
                        className={`${
                          active
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        } group flex w-full items-center px-4 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${item.className}`}
                      >
                        {item.icon && (
                          <item.icon
                            className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                            aria-hidden="true"
                          />
                        )}
                        {item.label}
                      </button>
                    )}
                  </Menu.Item>
                )}
              </Fragment>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

// Simple dropdown variant without headlessui
export interface SimpleDropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function SimpleDropdown({
  trigger,
  children,
  align = 'right',
  className = '',
  isOpen: controlledIsOpen,
  onClose,
}: SimpleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const actualIsOpen = controlledIsOpen !== undefined ? controlledIsOpen : isOpen;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const toggleDropdown = () => {
    if (controlledIsOpen === undefined) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded-lg"
        onClick={toggleDropdown}
      >
        {trigger}
        <ChevronDown className="ml-1 h-4 w-4" aria-hidden="true" />
      </button>

      {actualIsOpen && (
        <div
          className={`absolute z-50 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:border-gray-700 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}