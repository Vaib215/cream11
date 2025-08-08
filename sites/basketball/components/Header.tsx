
import React from 'react';
import { Link } from 'react-router-dom';
import { BasketballIcon } from './IconComponents';
import { APP_NAME, COLORS } from '../constants';

const Header = () => {
  return (
    <header className="shadow-lg p-4 sticky top-0 z-50 border-b-2" style={{ 
      backgroundColor: COLORS.secondary,
      borderBottomColor: COLORS.accent
    }}>
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="relative">
            <BasketballIcon className="w-12 h-12 text-orange-500 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-wider">Cream11</h1>
            <p className="text-sm text-orange-500 font-semibold tracking-wide">NBA Fantasy Platform</p>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-2">
          <div className="text-xs font-semibold text-white/80">POWERED BY</div>
          <a href="https://cream11.live" target="_blank" rel="noopener noreferrer" className="text-lg font-black text-orange-500 hover:text-orange-400 transition-colors">Cream11</a>
        </div>
      </div>
    </header>
  );
};

export default Header;
