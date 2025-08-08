
import React from 'react';
import { APP_NAME, COLORS } from '../constants';
import { BasketballIcon } from './IconComponents';

const Footer = () => {
  return (
    <footer className="mt-16 py-8 px-4 bg-gray-900 border-t border-gray-700">
      <div className="container mx-auto text-center">
        <div className="flex justify-center items-center gap-4 mb-4">
          <BasketballIcon className="w-8 h-8 text-orange-500" />
          <div className="text-2xl font-black text-white tracking-wider">Cream11</div>
          <BasketballIcon className="w-8 h-8 text-orange-500" />
        </div>
        
        <div className="text-sm text-white/90 mb-2 font-semibold">
          © 2025 Cream11. All rights reserved.
        </div>
        
        <div className="text-xs text-orange-500 font-bold tracking-wide">
          🤖 Powered by Advanced AI Analytics • 🏀 NBA Fantasy Platform
        </div>
      </div>
    </footer>
  );
};

export default Footer;
