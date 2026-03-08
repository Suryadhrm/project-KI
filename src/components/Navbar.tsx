import React from 'react';
import { Search, ShoppingCart, User as UserIcon, MapPin, Menu as MenuIcon, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../types';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  user: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onHomeClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount, onCartClick, user, onLoginClick, onLogout, onHomeClick, searchQuery, onSearchChange }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onHomeClick}
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="18" r="18" fill="url(#grad_logo)" />
              <path d="M10.5 10V14.5C10.5 16 11.5 17 12.5 17V25H14.5V17C15.5 17 16.5 16 16.5 14.5V10H15.3V14H14.1V10H12.9V14H11.7V10H10.5Z" fill="white" />
              <path d="M22.5 10C20.8 10 19.5 11.8 19.5 14C19.5 15.8 20.4 17.3 21.5 17.8V25H23.5V17.8C24.6 17.3 25.5 15.8 25.5 14C25.5 11.8 24.2 10 22.5 10Z" fill="white" />
              <defs>
                <linearGradient id="grad_logo" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6EE7B7" />
                  <stop offset="1" stopColor="#047857" />
                </linearGradient>
              </defs>
            </svg>
            <span className="font-display font-bold text-xl text-emerald-700 hidden sm:block">
              IPB Food
            </span>
          </div>

          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari makanan atau resto..."
                value={searchQuery || ''}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-1 text-slate-500 text-sm">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Dramaga, Bogor</span>
            </div>
            
            <button 
              onClick={onCartClick}
              className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>
            
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-slate-800">{user.name}</p>
                  <p className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider">{user.role}</p>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Keluar"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="btn-primary py-2 px-6 text-sm"
              >
                Masuk
              </button>
            )}
            
            <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
