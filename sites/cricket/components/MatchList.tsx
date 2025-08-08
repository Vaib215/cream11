
import React from 'react';
import type { Match } from '../types';

interface MatchListProps {
    matches: Match[];
    selectedMatch: Match | null;
    onMatchSelect: (match: Match) => void;
}

const MatchList: React.FC<MatchListProps> = ({ matches, selectedMatch, onMatchSelect }) => {
    return (
        <div className="w-full lg:w-1/3 flex-shrink-0">
            <h2 className="text-xl font-bold text-white mb-4 px-2">Upcoming Matches</h2>
            <div className="space-y-3">
                {matches.map((match, index) => {
                    const isSelected = selectedMatch?.teamA === match.teamA && selectedMatch?.teamB === match.teamB && selectedMatch?.date === match.date;
                    return (
                        <div
                            key={index}
                            onClick={() => onMatchSelect(match)}
                            className={`p-4 rounded-lg cursor-pointer transition-all duration-300 border-2 ${
                                isSelected 
                                ? 'bg-brand-primary/20 border-brand-primary' 
                                : 'bg-base-200 border-base-300 hover:bg-base-300/70 hover:border-base-300'
                            }`}
                        >
                            <p className="font-bold text-white text-lg">{match.teamA} vs {match.teamB}</p>
                            <p className="text-sm text-gray-400">{match.tournament}</p>
                            <p className="text-xs text-gray-500 mt-1">{match.date}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MatchList;
