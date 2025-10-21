
import React from 'react';
import { JerseyIcon } from './icons/JerseyIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 sticky top-0 z-10 shadow-lg">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <JerseyIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-emerald-500" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              <span className="text-emerald-400">FPL</span> Cream<span className="text-emerald-400">11</span>
            </h1>
            <JerseyIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-emerald-500" />
          </div>
          <p className="text-gray-400 mt-1 text-xs sm:text-sm">
            Powered by Gemini for Premier League Insights
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
