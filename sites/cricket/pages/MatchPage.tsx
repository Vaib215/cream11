import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Match, DreamTeamResponse, Player } from '../types';
import { generateDreamTeam } from '../services/geminiService';
import Spinner from '../components/Spinner';
import DreamTeam from '../components/DreamTeam';
import MatchDetail from '../components/MatchDetail';
import CricketIcon from '../components/icons/CricketIcon';

const MATCHES_STORAGE_KEY = 'cream11_matches';
const DREAM_TEAM_STORAGE_KEY = 'cream11_dream_teams';

const MatchPage: React.FC = () => {
    const { matchId } = useParams<{ matchId: string }>();
    const [match, setMatch] = useState<Match | null>(null);
    const [dreamTeamResult, setDreamTeamResult] = useState<DreamTeamResponse | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get match from local storage
    const getMatchFromStorage = useCallback(() => {
        try {
            const cachedMatches = localStorage.getItem(MATCHES_STORAGE_KEY);
            if (cachedMatches && matchId) {
                let matches: Match[];
                const parsedData = JSON.parse(cachedMatches);
                
                // Handle both old format (direct array) and new format (object with cream11_matches property)
                if (Array.isArray(parsedData)) {
                    matches = parsedData;
                } else if (parsedData.cream11_matches) {
                    // If cream11_matches is a string, parse it; if it's already an array, use it directly
                    matches = typeof parsedData.cream11_matches === 'string' 
                        ? JSON.parse(parsedData.cream11_matches)
                        : parsedData.cream11_matches;
                } else {
                    console.error('Invalid matches data format:', parsedData);
                    return null;
                }
                
                const decodedMatchId = decodeURIComponent(matchId);
                const foundMatch = matches.find(m => 
                    `${m.teamA}-vs-${m.teamB}` === decodedMatchId
                );
                return foundMatch || null;
            }
        } catch (error) {
            console.error('Error reading match from storage:', error);
        }
        return null;
    }, [matchId]);

    // Get cached dream team
    const getCachedDreamTeam = useCallback((match: Match) => {
        try {
            const cachedTeams = localStorage.getItem(DREAM_TEAM_STORAGE_KEY);
            if (cachedTeams) {
                const teams: Record<string, DreamTeamResponse> = JSON.parse(cachedTeams);
                const matchKey = `${match.teamA}-vs-${match.teamB}`;
                const cachedTeam = teams[matchKey];
                
                if (cachedTeam) {
                    // Handle allPlayers data structure - convert object to array if needed
                    if (cachedTeam.allPlayers && typeof cachedTeam.allPlayers === 'object' && !Array.isArray(cachedTeam.allPlayers)) {
                        // Convert object with team keys to flat array
                        const allPlayersArray = Object.values(cachedTeam.allPlayers as Record<string, Player[]>).flat();
                        return {
                            ...cachedTeam,
                            allPlayers: allPlayersArray
                        };
                    }
                    return cachedTeam;
                }
            }
        } catch (error) {
            console.error('Error reading cached dream team:', error);
        }
        return null;
    }, []);

    // Cache dream team
    const cacheDreamTeam = useCallback((match: Match, dreamTeam: DreamTeamResponse) => {
        try {
            const cachedTeams = localStorage.getItem(DREAM_TEAM_STORAGE_KEY);
            const teams: Record<string, DreamTeamResponse> = cachedTeams ? JSON.parse(cachedTeams) : {};
            const matchKey = `${match.teamA}-vs-${match.teamB}`;
            teams[matchKey] = dreamTeam;
            localStorage.setItem(DREAM_TEAM_STORAGE_KEY, JSON.stringify(teams));
        } catch (error) {
            console.error('Error caching dream team:', error);
        }
    }, []);

    // Generate dream team
    const handleGenerateDreamTeam = useCallback(async (match: Match) => {
        // Check for cached dream team first
        const cachedTeam = getCachedDreamTeam(match);
        if (cachedTeam) {
            setDreamTeamResult(cachedTeam);
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const result = await generateDreamTeam(match);
            setDreamTeamResult(result);
            
            // Cache the generated dream team
            cacheDreamTeam(match, result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsGenerating(false);
        }
    }, [getCachedDreamTeam, cacheDreamTeam]);

    // Load match and generate dream team on mount
    useEffect(() => {
        const foundMatch = getMatchFromStorage();
        if (foundMatch) {
            setMatch(foundMatch);
            handleGenerateDreamTeam(foundMatch);
        } else {
            setError('Match not found. Please go back to the home page.');
        }
    }, [getMatchFromStorage, handleGenerateDreamTeam]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (error && !match) {
        return (
            <div className="min-h-screen bg-base-100 flex items-center justify-center">
                <div className="text-center">
                    <CricketIcon className="w-24 h-24 text-base-300 mb-6 mx-auto" />
                    <h2 className="text-2xl font-bold text-white mb-4">Match Not Found</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <Link 
                        to="/" 
                        className="bg-brand-primary text-white font-bold py-3 px-6 rounded-full hover:bg-brand-secondary transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    if (!match) {
        return (
            <div className="min-h-screen bg-base-100 flex items-center justify-center">
                <Spinner message="Loading match details..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100">
            <div className="container mx-auto p-4 md:p-8">
                {/* Back button */}
                <div className="mb-6">
                    <Link 
                        to="/" 
                        className="inline-flex items-center text-brand-primary hover:text-brand-secondary transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Matches
                    </Link>
                </div>

                {/* Match Header */}
                <div className="bg-base-200 rounded-lg p-6 mb-8 border border-base-300">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-white mb-2">{match.tournament}</h1>
                        <div className="flex justify-center items-center gap-8 mb-4">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-brand-primary">{match.teamA}</h2>
                            </div>
                            <div className="text-gray-400 font-bold text-xl">VS</div>
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-brand-primary">{match.teamB}</h2>
                            </div>
                        </div>
                        <div className="text-gray-400">
                            <p className="text-lg">{formatDate(match.date)}</p>
                            <p className="text-base">{match.venue}</p>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {isGenerating && (
                    <div className="text-center py-12">
                        <Spinner message="Generating your dream team..." />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center bg-red-900/50 text-red-400 p-6 rounded-lg mb-8">
                        <p className="font-bold text-lg">Error Generating Dream Team</p>
                        <p className="mt-2">{error}</p>
                        <button
                            onClick={() => handleGenerateDreamTeam(match)}
                            className="mt-4 bg-brand-primary text-white font-bold py-2 px-6 rounded-full hover:bg-brand-secondary transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Dream Team Results */}
                {dreamTeamResult && (
                    <MatchDetail 
                        match={match}
                        dreamTeamResult={dreamTeamResult}
                        isGenerating={false}
                        onGenerate={() => handleGenerateDreamTeam(match)}
                        error={null}
                    />
                )}
            </div>
        </div>
    );
};

export default MatchPage;