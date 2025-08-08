import React, { useState, useEffect, useCallback } from "react";
import GameCard from "./GameCard";
import { fetchUpcomingGames } from "../services/geminiService";
import type { Game } from "../types";
import { APP_NAME } from "../constants";
import { BasketballIcon } from "./IconComponents";
import Loader from "./Loader";

const GAMES_STORAGE_KEY = "cream11_nba_games";
const CACHE_DATE_KEY = "cream11_nba_cache_date";

const HomePage = () => {
  const [games, setGames] = useState<Game[] | null>(null);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
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
      const cachedGames = localStorage.getItem(GAMES_STORAGE_KEY);

      if (cachedGames && isCacheValid()) {
        let games: Game[];
        const parsedGamesData = JSON.parse(cachedGames);

        // Handle both old format (direct array) and new format (object with games property)
        if (Array.isArray(parsedGamesData)) {
          games = parsedGamesData;
        } else if (parsedGamesData.games) {
          games =
            typeof parsedGamesData.games === "string"
              ? JSON.parse(parsedGamesData.games)
              : parsedGamesData.games;
        } else {
          console.error("Invalid games data format:", parsedGamesData);
          return null;
        }

        return { games };
      }
    } catch (error) {
      console.error("Error reading cached data:", error);
    }
    return null;
  };

  const setCachedData = (games: Game[]) => {
    try {
      localStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(games));
      localStorage.setItem(CACHE_DATE_KEY, getTodayDateString());
    } catch (error) {
      console.error("Error caching data:", error);
    }
  };

  const clearOldCache = () => {
    if (!isCacheValid()) {
      localStorage.removeItem(GAMES_STORAGE_KEY);
      localStorage.removeItem(CACHE_DATE_KEY);
    }
  };

  const handleFetchGames = useCallback(async (forceRefresh = false) => {
    // Clear old cache first
    clearOldCache();

    // Check for cached data if not forcing refresh
    if (!forceRefresh) {
      const cachedData = getCachedData();
      if (cachedData) {
        setGames(cachedData.games);
        return;
      }
    }

    setIsLoadingGames(true);
    setError(null);
    setGames(null);

    try {
      const { games: fetchedGames } = await fetchUpcomingGames();
      setGames(fetchedGames);

      // Cache the fetched data
      setCachedData(fetchedGames);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setIsLoadingGames(false);
    }
  }, []);

  // Auto-fetch games on component mount
  useEffect(() => {
    handleFetchGames();
  }, [handleFetchGames]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12 p-8 bg-gray-900 rounded-xl shadow-xl border border-gray-700">
        <BasketballIcon className="w-20 h-20 text-orange-500 mx-auto mb-6 animate-bounce" />
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
          Welcome to <span className="text-orange-500">{APP_NAME}</span>
        </h1>
        <div className="mb-4">
          <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm tracking-wider shadow-lg">
            🏀 OFFICIAL NBA FANTASY PLATFORM 🏀
          </div>
        </div>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Dominate your fantasy league with AI-powered insights. Select a game below to
          generate championship-winning lineups backed by advanced NBA analytics.
        </p>
      </div>

      {/* Loading State */}
      {isLoadingGames && <Loader message="Loading upcoming NBA games..." />}

      {/* Error State */}
      {error && (
        <div className="text-center p-8 bg-red-900/20 rounded-xl border border-red-500/50">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">Unable to Load Games</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
             onClick={() => handleFetchGames(true)}
             className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 shadow-lg"
           >
             Try Again
           </button>
         </div>
       )}

      {/* No Games State */}
      {!isLoadingGames && !games && !error && (
        <div className="text-center flex flex-col items-center justify-center pt-16">
          <BasketballIcon className="w-32 h-32 text-gray-500 mb-8 animate-pulse" />
          <h3 className="text-2xl font-bold text-white mb-2">🏀 NO GAMES SCHEDULED</h3>
          <p className="text-gray-400 text-lg">Check back later for upcoming NBA matchups</p>
        </div>
      )}

      {/* Games List */}
      {games && games.length > 0 && (
        <div>
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-white mb-4 drop-shadow-lg">
              🏀 TODAY'S NBA GAMES
            </h2>
            <div className="w-32 h-1 bg-orange-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}

      {/* Empty Games State */}
      {games && games.length === 0 && (
        <div className="text-center flex flex-col items-center justify-center pt-16">
          <BasketballIcon className="w-32 h-32 text-gray-500 mb-8 animate-pulse" />
          <h2 className="text-3xl font-black text-white mb-4">🏀 NO GAMES FOUND</h2>
          <p className="text-gray-300 text-lg max-w-md mx-auto">
            The NBA schedule is currently empty. Check back soon for upcoming matchups!
          </p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
