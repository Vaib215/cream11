import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Match, GroundingSource } from '../types';
import { fetchUpcomingMatches } from '../services/geminiService';
import Spinner from '../components/Spinner';
import Footer from '../components/Footer';
import CricketIcon from '../components/icons/CricketIcon';

const MATCHES_STORAGE_KEY = 'cream11_matches';
const CACHE_DATE_KEY = 'cream11_cache_date';

const Home: React.FC = () => {
    const [matches, setMatches] = useState<Match[] | null>(null);
    const [isLoadingMatches, setIsLoadingMatches] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Helper functions for local storage
    const getTodayDateString = () => {
        return new Date().toDateString();
    };

    const isCacheValid = () => {
        const cachedDate = localStorage.getItem(CACHE_DATE_KEY);
        return cachedDate === getTodayDateString();
    };

    const getCachedData = () => {
        try {
            const cachedMatches = localStorage.getItem(MATCHES_STORAGE_KEY);

            if (cachedMatches && isCacheValid()) {
                let matches: Match[];
                const parsedMatchesData = JSON.parse(cachedMatches);

                // Handle both old format (direct array) and new format (object with cream11_matches property)
                if (Array.isArray(parsedMatchesData)) {
                    matches = parsedMatchesData;
                } else if (parsedMatchesData.cream11_matches) {
                    // If cream11_matches is a string, parse it; if it's already an array, use it directly
                    matches = typeof parsedMatchesData.cream11_matches === 'string'
                        ? JSON.parse(parsedMatchesData.cream11_matches)
                        : parsedMatchesData.cream11_matches;
                } else {
                    console.error('Invalid matches data format:', parsedMatchesData);
                    return null;
                }

                return {
                    matches,
                };
            }
        } catch (error) {
            console.error('Error reading cached data:', error);
        }
        return null;
    };

    const setCachedData = (matches: Match[]) => {
        try {
            localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(matches));
            localStorage.setItem(CACHE_DATE_KEY, getTodayDateString());
        } catch (error) {
            console.error('Error caching data:', error);
        }
    };

    const clearOldCache = () => {
        if (!isCacheValid()) {
            localStorage.removeItem(MATCHES_STORAGE_KEY);
            localStorage.removeItem(CACHE_DATE_KEY);
        }
    };

    const handleFetchMatches = useCallback(async (forceRefresh = false) => {
        // Clear old cache first
        clearOldCache();

        // Check for cached data if not forcing refresh
        if (!forceRefresh) {
            const cachedData = getCachedData();
            if (cachedData) {
                setMatches(cachedData.matches);
                return;
            }
        }

        setIsLoadingMatches(true);
        setError(null);
        setMatches(null);

        try {
            const { matches: fetchedMatches } = await fetchUpcomingMatches();
            setMatches(fetchedMatches);

            // Cache the fetched data
            setCachedData(fetchedMatches);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoadingMatches(false);
        }
    }, []);

    // Auto-fetch matches on component mount
    useEffect(() => {
        handleFetchMatches();
    }, [handleFetchMatches]);



    return (
        <div className="min-h-screen bg-base-100">
            <div className="container mx-auto p-4 md:p-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-4">Upcoming Cricket Matches</h1>
                    <p className="text-lg text-gray-400">
                        Click on any match to generate your AI-powered Dream Team
                    </p>
                </div>

                {isLoadingMatches && <Spinner message="Loading upcoming matches..." />}

                {error && (
                    <div className="text-center bg-red-900/50 text-red-400 p-4 rounded-lg mb-8">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}

                {!isLoadingMatches && !matches && !error && (
                    <div className="text-center flex flex-col items-center justify-center pt-16">
                        <CricketIcon className="w-24 h-24 text-base-300 mb-6" />
                        <p className="text-gray-500">No matches available</p>
                    </div>
                )}

                {matches && matches.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {matches.map((match, index) => (
                            <Link
                                key={index}
                                to={`/match/${encodeURIComponent(`${match.teamA}-vs-${match.teamB}`)}`}
                                className="bg-base-200/70 p-6 rounded-xl shadow-lg border border-base-300 hover:border-brand-primary transition-all duration-300 transform hover:scale-105 block"
                            >
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {match.teamA} vs {match.teamB}
                                </h3>
                                <div className="text-gray-400 space-y-1">
                                    <p><span className="font-semibold text-gray-300">Tournament:</span> {match.tournament}</p>
                                    <p><span className="font-semibold text-gray-300">Date:</span> {match.date}</p>
                                    <p><span className="font-semibold text-gray-300">Venue:</span> {match.venue}</p>
                                </div>
                                <div className="mt-4 text-brand-primary font-semibold">
                                    Click to generate Dream Team →
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {matches && matches.length === 0 && (
                    <div className="text-center flex flex-col items-center justify-center pt-16">
                        <CricketIcon className="w-24 h-24 text-base-300 mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-4">No Matches Found</h2>
                        <p className="text-gray-400">There are no upcoming cricket matches available at the moment.</p>
                    </div>
                )}
            </div>

            {/* Footer with sources */}
            <Footer />
        </div>
    );
};

export default Home;