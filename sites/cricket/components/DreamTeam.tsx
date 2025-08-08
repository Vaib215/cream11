
import React from 'react';
import { Player } from '../types';
import { RoleIcon } from './icons/PlayerRoleIcons';

interface DreamTeamProps {
    team: Player[];
}

const DreamTeam: React.FC<DreamTeamProps> = ({ team }) => {
    // Calculate team composition stats
    const wkCount = team.filter(p => p.role === 'Wicket-Keeper').length;
    const batCount = team.filter(p => p.role === 'Batsman').length;
    const arCount = team.filter(p => p.role === 'All-Rounder').length;
    const bowlCount = team.filter(p => p.role === 'Bowler').length;
    const totalCredits = team.reduce((sum, p) => sum + (p.credits || 0), 0);
    const captain = team.find(p => p.isCaptain);
    const viceCaptain = team.find(p => p.isViceCaptain);
    
    // Count players per team
    const teamCounts = team.reduce((acc, player) => {
        acc[player.team] = (acc[player.team] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const maxPlayersFromOneTeam = Math.max(...Object.values(teamCounts));

    return (
        <div className="mt-8">
            <h3 className="text-2xl font-bold text-white mb-4 animate-fade-in">Your AI-Generated Dream Team</h3>
            
            {/* Team Composition Summary */}
            <div className="bg-base-300/30 p-4 rounded-lg mb-6 border border-base-300">
                <h4 className="text-lg font-semibold text-white mb-3">Team Composition</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                        <p className="text-gray-400">Wicket-Keepers</p>
                        <p className="text-white font-bold">{wkCount}/4</p>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-400">Batsmen</p>
                        <p className="text-white font-bold">{batCount}/6</p>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-400">All-Rounders</p>
                        <p className="text-white font-bold">{arCount}/4</p>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-400">Bowlers</p>
                        <p className="text-white font-bold">{bowlCount}/6</p>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-base-300">
                    <div className="text-sm">
                        <span className="text-gray-400">Total Credits: </span>
                        <span className={`font-bold ${totalCredits <= 100 ? 'text-green-400' : 'text-red-400'}`}>
                            {totalCredits.toFixed(1)}/100
                        </span>
                    </div>
                    <div className="text-sm">
                        <span className="text-gray-400">Max from one team: </span>
                        <span className={`font-bold ${maxPlayersFromOneTeam <= 7 ? 'text-green-400' : 'text-red-400'}`}>
                            {maxPlayersFromOneTeam}/7
                        </span>
                    </div>
                    <div className="text-sm">
                        <span className="text-gray-400">Captain: </span>
                        <span className="text-yellow-400 font-bold">{captain?.name || 'None'}</span>
                    </div>
                    <div className="text-sm">
                        <span className="text-gray-400">Vice-Captain: </span>
                        <span className="text-yellow-300 font-bold">{viceCaptain?.name || 'None'}</span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {team.map((player, index) => (
                    <div 
                        key={`${player.name}-${index}`} 
                        className="bg-base-300/50 p-4 rounded-lg shadow-md flex items-center gap-4 border border-base-300 transition-all duration-300 hover:border-brand-primary hover:bg-base-200/70"
                        style={{ animationDelay: `${index * 50}ms`, animation: `fade-in-up 0.5s ease-out forwards` }}
                    >
                        {player.photoUrl ? (
                            <img 
                                src={player.photoUrl} 
                                alt={`Photo of ${player.name}`}
                                className="w-16 h-16 rounded-full object-cover border-2 border-brand-primary"
                            />
                        ) : (
                            <div className="bg-brand-primary p-2 rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0">
                               <RoleIcon role={player.role} className="w-8 h-8 text-white"/>
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold text-white text-lg">{player.name}</p>
                                {player.isCaptain && (
                                    <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">C</span>
                                )}
                                {player.isViceCaptain && (
                                    <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">VC</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-400">{player.team}</p>
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-brand-light font-semibold">{player.role}</p>
                                {player.credits && (
                                    <p className="text-xs text-green-400 font-semibold">{player.credits} cr</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    opacity: 0;
                    animation: fade-in-up 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default DreamTeam;