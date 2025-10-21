
import React from 'react';
import { Team, Match, Player } from '../types';
import { JerseyIcon } from './icons/JerseyIcon';

interface TeamDisplayProps {
  teamData: Team;
  match: Match;
  onBack: () => void;
}

const PlayerCard: React.FC<{ player: Player }> = ({ player }) => (
  <div className="group relative flex flex-col items-center text-center">
    <div className="relative">
      <JerseyIcon className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-emerald-400" />
      <span className="absolute inset-0 flex items-center justify-center font-bold text-xs text-gray-900">
        {player.name.split(' ').pop()?.charAt(0) || ''}
      </span>
    </div>
    <p className="font-bold text-xs sm:text-sm mt-1 truncate w-full max-w-[60px] sm:max-w-[80px] md:max-w-[100px]">{player.name}</p>
    <p className="text-xs text-gray-400 hidden sm:block">{player.club}</p>
    <div className="absolute bottom-full mb-2 w-40 sm:w-56 md:w-64 p-2 sm:p-3 bg-gray-800 border border-emerald-500/30 rounded-lg text-left text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-xl">
      <h4 className="font-bold text-emerald-400 mb-1">Selection Rationale</h4>
      <p className="text-gray-300 text-xs sm:text-sm">{player.reasoning}</p>
    </div>
  </div>
);

const renderPlayerLine = (players: Player[]) => (
  <div className="flex justify-around w-full gap-1 sm:gap-2">
    {players.map((player, index) => (
      <PlayerCard key={`${player.name}-${index}`} player={player} />
    ))}  
  </div>
);

const TeamDisplay: React.FC<TeamDisplayProps> = ({ teamData, match, onBack }) => {
  const { team, formation, strategy } = teamData;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <button
          onClick={onBack}
          className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-gray-600 flex items-center gap-2 w-full sm:w-auto"
        >
          <span className="text-lg">←</span> Back to Fixtures
        </button>
        <div className="text-left sm:text-right w-full sm:w-auto">
          <h2 className="text-xl font-bold text-emerald-400">{formation} Formation</h2>
          <p className="text-gray-400 text-sm sm:text-base">{match.team1.name} vs {match.team2.name}</p>
        </div>
      </div>

      <div className="bg-gradient-to-b from-green-900/30 to-green-800/20 border border-gray-500/30 sm:border-2 md:border-4 rounded-lg p-2 sm:p-4 lg:p-8 mb-4 sm:mb-6 relative overflow-hidden" style={{ 
        backgroundImage: `
          repeating-linear-gradient(to right, rgba(16, 185, 129, 0.1) 0px, rgba(16, 185, 129, 0.1) 15px, transparent 15px, transparent 30px),
          repeating-linear-gradient(to bottom, rgba(16, 185, 129, 0.1) 0px, rgba(16, 185, 129, 0.1) 15px, transparent 15px, transparent 30px)
        `,
       }}>
        {/* Football field markings */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-500/30"></div>
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-emerald-500/30"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 sm:w-24 md:w-32 h-16 sm:h-24 md:h-32 border-2 border-emerald-500/30 rounded-full"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 sm:w-48 md:w-64 h-16 sm:h-24 md:h-32 border-2 border-emerald-500/30 rounded-b-full border-t-0"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 sm:w-48 md:w-64 h-16 sm:h-24 md:h-32 border-2 border-emerald-500/30 rounded-t-full border-b-0"></div>
        
        <div className="relative flex flex-col h-[300px] sm:h-[400px] md:h-[500px] justify-between z-0">
            {renderPlayerLine(team.forwards)}
            {renderPlayerLine(team.midfielders)}
            {renderPlayerLine(team.defenders)}
            {renderPlayerLine(team.goalkeeper)}
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-gray-800 to-gray-800/80 rounded-lg p-3 sm:p-4 md:p-6 border border-emerald-700/30 shadow-lg">
        <h3 className="text-xl sm:text-2xl font-bold text-emerald-400 mb-2 sm:mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI Strategy Analysis
        </h3>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{strategy}</p>
      </div>
    </div>
  );
};

export default TeamDisplay;
