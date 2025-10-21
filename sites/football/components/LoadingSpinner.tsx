import React from 'react';
import { Match } from '../types';

interface LoadingSpinnerProps {
    match: Match | null;
    message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ match, message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] sm:min-h-[400px] text-center">
      <svg className="animate-spin -ml-1 mr-3 h-10 w-10 sm:h-12 sm:w-12 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <h2 className="text-xl sm:text-2xl font-bold mt-4 sm:mt-6 text-gray-200">{message || 'Generating Your FPL Team...'}</h2>
      {match && <p className="text-gray-400 mt-2 text-sm sm:text-base">Analyzing the matchup: {match.team1.name} vs {match.team2.name}</p>}
      <p className="text-gray-500 mt-3 sm:mt-4 max-w-md text-xs sm:text-sm">
        {message 
          ? 'Please wait while we connect to our services.'
          : 'Our AI is considering player form, fixture difficulty, and tactical advantages to build the optimal squad. This may take a moment.'
        }
      </p>
    </div>
  );
};

export default LoadingSpinner;
