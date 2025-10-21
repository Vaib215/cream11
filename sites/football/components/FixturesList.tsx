
import React from 'react';
import { Match } from '../types';
import MatchCard from './MatchCard';

interface FixturesListProps {
  matches: Match[];
  onGenerateTeam: (match: Match) => void;
}

const FixturesList: React.FC<FixturesListProps> = ({ matches, onGenerateTeam }) => {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-gray-300">Upcoming Gameweek</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} onGenerateTeam={onGenerateTeam} />
        ))}
      </div>
    </div>
  );
};

export default FixturesList;
