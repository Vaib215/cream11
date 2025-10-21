import React, { useState } from 'react';
import { JerseyIcon } from './JerseyIcon';

interface TeamLogoProps {
  logoUrl: string;
  teamName: string;
  className?: string;
}

const TeamLogo: React.FC<TeamLogoProps> = ({ logoUrl, teamName, className = "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" }) => {
  const [hasError, setHasError] = useState(false);
  
  // Generate team color based on team name for consistent fallback colors
  const getTeamColor = (name: string) => {
    const colors = [
      'text-red-500', 'text-blue-500', 'text-yellow-500', 'text-purple-500',
      'text-green-500', 'text-pink-500', 'text-indigo-500', 'text-orange-500'
    ];
    
    // Simple hash function to get consistent color for same team name
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (hasError) {
    return (
      <div className={`flex items-center justify-center ${className} bg-gray-800 rounded-full border border-gray-700 sm:border-2`}>
        <JerseyIcon className={`w-3/4 h-3/4 ${getTeamColor(teamName)}`} />
      </div>
    );
  }

  return (
    <img 
      src={logoUrl} 
      alt={teamName} 
      className={`${className} object-contain`}
      onError={() => setHasError(true)}
    />
  );
};

export default TeamLogo;