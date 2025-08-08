
import React from 'react';
import type { PlayerRole } from '../../types';

export const BatsmanIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 13.5h5.5"/>
        <path d="M13 19l-4-4-5 5"/>
        <path d="M13 5l4.5 4.5"/>
        <path d="m14 14 5.5-5.5"/>
    </svg>
);

export const BowlerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 12a4 4 0 1 0-8 0 4 4 0 0 0 8 0z"/>
        <path d="M18 22a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
        <path d="M12 12l6 6"/>
    </svg>
);

export const AllRounderIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21l3-3"/>
        <path d="M18 6l-3 3"/>
        <path d="m12.01 12.01 3.28-3.28a2 2 0 0 0 0-2.83l-.01-.01a2 2 0 0 0-2.83 0L9.17 9.17"/>
        <path d="m14.84 14.84 2.83-2.83a2 2 0 0 0 0-2.83l0 0a2 2 0 0 0-2.83 0l-2.83 2.83"/>
        <path d="M9.17 14.83 6.34 12a2 2 0 0 0-2.83 0h0a2 2 0 0 0 0 2.83L6.34 17.66"/>
    </svg>
);

export const WicketKeeperIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 13.4V21a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7.6c0-1.6.9-3.2 2.3-4.1l5-3.3c.7-.5 1.7-.5 2.4 0l5 3.3c1.4.9 2.3 2.5 2.3 4.1Z"/>
        <path d="m10 13 2 2 2-2"/>
    </svg>
);

export const RoleIcon: React.FC<{ role: PlayerRole; className?: string }> = ({ role, className }) => {
    switch (role) {
        case 'Batsman':
            return <BatsmanIcon className={className} />;
        case 'Bowler':
            return <BowlerIcon className={className} />;
        case 'All-Rounder':
            return <AllRounderIcon className={className} />;
        case 'Wicket-Keeper':
            return <WicketKeeperIcon className={className} />;
        default:
            return null;
    }
};
