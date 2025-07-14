
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, DumbbellIcon, AppleIcon, ChartBarIcon, BookOpenIcon } from '../icons/Icons';

const Navbar: React.FC = () => {
  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Inicio' },
    { path: '/workout', icon: DumbbellIcon, label: 'Entreno' },
    { path: '/library', icon: BookOpenIcon, label: 'Biblioteca' },
    { path: '/nutrition', icon: AppleIcon, label: 'Nutrición' },
    { path: '/progress', icon: ChartBarIcon, label: 'Progreso' },
  ];

  const navLinkClasses = "flex flex-col items-center justify-center text-gray-400 hover:text-brand-primary transition-colors w-1/5";
  const activeNavLinkClasses = "text-brand-primary";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 shadow-lg">
      <div className="max-w-md mx-auto h-16 flex justify-around items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
