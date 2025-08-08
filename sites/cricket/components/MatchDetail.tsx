import React, { useState } from 'react';
import { marked } from 'marked';
import type { Match, Player, DreamTeamResponse } from '../types';
import DreamTeam from './DreamTeam';
import Spinner from './Spinner';
import { RoleIcon } from './icons/PlayerRoleIcons';

interface MatchDetailProps {
    match: Match;
    dreamTeamResult: DreamTeamResponse | null;
    isGenerating: boolean;
    onGenerate: () => void;
    error: string | null;
}

const AllPlayersList: React.FC<{ players: Player[], teamA: string, teamB: string }> = ({ players, teamA, teamB }) => {
    const [activeTab, setActiveTab] = useState<'teamA' | 'teamB'>('teamA');
    
    const teamAPlayers = players.filter(p => p.team === teamA);
    const teamBPlayers = players.filter(p => p.team === teamB);

    const renderPlayer = (player: Player, index: number) => (
         <div key={`${player.name}-${index}`} className="bg-base-300/50 p-3 rounded-lg flex items-center gap-3">
            <RoleIcon role={player.role} className="w-5 h-5 text-brand-light flex-shrink-0" />
            <div className="flex-1">
                <p className="font-semibold text-white text-base">{player.name}</p>
                <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400">{player.role}</p>
                    {player.credits && (
                        <p className="text-xs text-green-400 font-semibold">{player.credits} cr</p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="mt-8">
            <h3 className="text-2xl font-bold text-white mb-4">Available Player Squads</h3>
            <div className="flex border-b border-base-300 mb-4">
                <button 
                    onClick={() => setActiveTab('teamA')}
                    className={`px-4 py-2 font-semibold text-lg transition-colors duration-200 ${activeTab === 'teamA' ? 'text-brand-light border-b-2 border-brand-light' : 'text-gray-400'}`}
                >
                    {teamA}
                </button>
                <button 
                    onClick={() => setActiveTab('teamB')}
                    className={`px-4 py-2 font-semibold text-lg transition-colors duration-200 ${activeTab === 'teamB' ? 'text-brand-light border-b-2 border-brand-light' : 'text-gray-400'}`}
                >
                    {teamB}
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeTab === 'teamA' && teamAPlayers.map(renderPlayer)}
                {activeTab === 'teamB' && teamBPlayers.map(renderPlayer)}
            </div>
        </div>
    );
};


const ReasoningModal: React.FC<{ reasoning: string; isOpen: boolean; onClose: () => void }> = ({ reasoning, isOpen, onClose }) => {
    const rawMarkup = marked.parse(reasoning, { breaks: true, gfm: true }) as string;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-base-200 rounded-lg max-w-4xl max-h-[80vh] overflow-y-auto w-full">
                <div className="sticky top-0 bg-base-200 p-4 border-b border-base-300 flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-white">AI's Reasoning</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>
                <div className="p-6">
                    <div
                        className="markdown-content text-gray-300"
                        dangerouslySetInnerHTML={{ __html: rawMarkup }}
                    />
                </div>
            </div>
        </div>
    );
};

const TeamReasoning: React.FC<{ reasoning: string }> = ({ reasoning }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="mt-6 text-center">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-base-300/50 hover:bg-base-300/70 text-brand-light font-semibold py-2 px-4 rounded-lg border border-base-300 transition-all duration-300 hover:border-brand-primary"
                >
                    View AI's Reasoning
                </button>
            </div>
            <ReasoningModal 
                reasoning={reasoning} 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
            <style>{`
                .markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4, .markdown-content h5, .markdown-content h6 {
                    color: white;
                    font-weight: 600;
                    margin-top: 1.25em;
                    margin-bottom: 0.75em;
                }
                .markdown-content h3 { font-size: 1.25rem; }
                .markdown-content h4 { font-size: 1.1rem; }
                .markdown-content p {
                    line-height: 1.7;
                    margin-bottom: 1em;
                }
                .markdown-content ul, .markdown-content ol {
                    padding-left: 1.5em;
                    margin-bottom: 1em;
                }
                .markdown-content ul {
                    list-style-type: disc;
                }
                 .markdown-content ol {
                    list-style-type: decimal;
                }
                .markdown-content li {
                    margin-bottom: 0.5em;
                }
                .markdown-content strong, .markdown-content b {
                    color: white;
                    font-weight: 600;
                }
                .markdown-content a {
                    color: #10B981; /* brand-light */
                    text-decoration: underline;
                }
                .markdown-content a:hover {
                    color: #059669; /* brand-primary */
                }
                .markdown-content blockquote {
                    border-left: 4px solid #4b5563; /* base-300 */
                    padding-left: 1rem;
                    color: #d1d5db; /* gray-300 */
                    font-style: italic;
                }
                .markdown-content code {
                    background-color: #1f2937; /* base-100 */
                    padding: 0.2em 0.4em;
                    border-radius: 3px;
                    font-family: monospace;
                }
                .markdown-content pre {
                     background-color: #1f2937; /* base-100 */
                     padding: 1em;
                     border-radius: 6px;
                     overflow-x: auto;
                }
            `}</style>
        </>
    );
};


const MatchDetail: React.FC<MatchDetailProps> = ({ match, dreamTeamResult, isGenerating, onGenerate, error }) => {
    return (
        <div className="bg-base-200/70 p-6 rounded-xl shadow-2xl border border-base-300 w-full animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{match.teamA} vs {match.teamB}</h2>
            <div className="text-gray-400 mb-6 space-y-1">
                <p><span className="font-semibold text-gray-300">Tournament:</span> {match.tournament}</p>
                <p><span className="font-semibold text-gray-300">Date:</span> {match.date}</p>
                <p><span className="font-semibold text-gray-300">Venue:</span> {match.venue}</p>
            </div>
            
            {!dreamTeamResult && (
                <button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="w-full bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-secondary transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-light focus:ring-opacity-50 disabled:bg-base-300 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                    {isGenerating ? "Crafting Your Cream11..." : "Generate Cream11 Team"}
                </button>
            )}
            
            {isGenerating && <Spinner message="Generating your dream team..." />}
            
            {error && <div className="mt-4 text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</div>}

            {dreamTeamResult && (
                <div className="mt-6">
                    <DreamTeam team={dreamTeamResult.dreamTeam} />
                    <TeamReasoning reasoning={dreamTeamResult.reasoning} />
                    <AllPlayersList players={dreamTeamResult.allPlayers} teamA={match.teamA} teamB={match.teamB} />
                </div>
            )}

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default MatchDetail;