
import React from 'react';
import { Match } from '../types';
import TeamLogo from './icons/TeamLogo';

interface MatchCardProps {
  match: Match;
  onGenerateTeam: (match: Match) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onGenerateTeam }) => {
  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-lg overflow-hidden transition-all duration-300 hover:border-emerald-500 hover:shadow-emerald-500/20">
      <div className="p-5 relative">
        {/* Football field background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white"></div>
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white rounded-full"></div>
        </div>
        
        <p className="text-center text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 font-medium">{match.date}</p>
        <div className="flex justify-around items-center relative z-10">
          <div className="flex flex-col items-center gap-2 sm:gap-3 w-1/3">
            <TeamLogo logoUrl={match.team1.logo} teamName={match.team1.name} className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" />
            <span className="font-bold text-center text-xs sm:text-sm md:text-base truncate px-1">{match.team1.name}</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-500">VS</div>
          <div className="flex flex-col items-center gap-2 sm:gap-3 w-1/3">
            <TeamLogo logoUrl={match.team2.logo} teamName={match.team2.name} className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" />
            <span className="font-bold text-center text-xs sm:text-sm md:text-base truncate px-1">{match.team2.name}</span>
          </div>
        </div>
      </div>
      <div className="p-3 sm:p-4 bg-gray-800/50 border-t border-gray-700/50">
        <button
          onClick={() => onGenerateTeam(match)}
          className="w-full bg-emerald-600 text-white font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-transform duration-200 hover:bg-emerald-500 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75 shadow-lg shadow-emerald-700/20 text-sm sm:text-base"
        >
          Generate Best Team
        </button>
      </div>
    </div>
  );
};

export default MatchCard;
