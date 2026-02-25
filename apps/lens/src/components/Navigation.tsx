'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/farm', label: 'Farm', icon: '🚜', theme: 'farm' },
  { href: '/garden', label: 'Garden', icon: '🌱', theme: 'garden' },
  { href: '/both', label: 'Both', icon: '👁️', theme: 'both' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const getActiveClass = (href: string, theme?: string) => {
    const isActive = pathname === href;
    if (!isActive) return 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300';
    
    switch (theme) {
      case 'farm':
        return 'border-[var(--farm-coral)] text-[var(--farm-coral)]';
      case 'garden':
        return 'border-[var(--garden-cyan)] text-[var(--garden-cyan)]';
      case 'both':
        return 'border-[var(--farm-yellow)] text-[var(--farm-yellow)]';
      default:
        return 'border-indigo-500 text-gray-900 dark:text-white';
    }
  };

  const getMobileActiveClass = (href: string, theme?: string) => {
    const isActive = pathname === href;
    if (!isActive) return 'border-transparent text-gray-500 hover:bg-gray-50';
    
    switch (theme) {
      case 'farm':
        return 'bg-[var(--farm-coral)]/10 border-[var(--farm-coral)] text-[var(--farm-coral)]';
      case 'garden':
        return 'bg-[var(--garden-cyan)]/10 border-[var(--garden-cyan)] text-[var(--garden-cyan)]';
      case 'both':
        return 'bg-[var(--farm-yellow)]/10 border-[var(--farm-yellow)] text-[var(--farm-yellow)]';
      default:
        return 'bg-indigo-50 border-indigo-500 text-indigo-700';
    }
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <motion.span 
                className="text-xl font-bold bg-gradient-to-r from-[var(--farm-teal)] to-[var(--garden-cyan)] bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
              >
                yield.garden
              </motion.span>
            </Link>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${getActiveClass(item.href, item.theme)}`}
                >
                  <motion.span
                    className="mr-2"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {item.icon}
                  </motion.span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center sm:hidden">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-300 hover:bg-gray-800"
              whileTap={{ scale: 0.95 }}
            >
              <span className="sr-only">Open menu</span>
              {isOpen ? '✕' : '☰'}
            </motion.button>
          </div>
        </div>
      </div>
      
      <motion.div 
        className="sm:hidden"
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ overflow: 'hidden' }}
      >
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${getMobileActiveClass(item.href, item.theme)}`}
              onClick={() => setIsOpen(false)}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </motion.div>
    </nav>
  );
}
