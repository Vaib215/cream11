
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 text-center text-gray-500">
        <p className="text-xs sm:text-sm">&copy; {new Date().getFullYear()} FPL Cream11. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
