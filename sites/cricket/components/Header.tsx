import React from 'react';
import CricketIcon from './icons/CricketIcon';

const Header: React.FC = () => {
    return (
        <header className="bg-base-200/50 backdrop-blur-sm shadow-lg sticky top-0 z-20">
            <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                <CricketIcon className="w-10 h-10 text-brand-primary" />
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    Cream<span className="text-brand-light">11</span>
                </h1>
            </div>
        </header>
    );
};

export default Header;