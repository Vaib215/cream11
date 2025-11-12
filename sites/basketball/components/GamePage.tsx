import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  fetchUpcomingGames,
  generateFantasyLineup,
} from "../services/geminiService";
import type { Game, Lineup } from "../types";
import PlayerCard from "./PlayerCard";
import Loader from "./Loader";
import BasketballCourt from "./BasketballCourt";
import AIAnalysisModal from "./AIAnalysisModal";
import { SALARY_CAP } from "../constants";
import { PositionIcon } from "./IconComponents";

const GAMES_STORAGE_KEY = "cream11_nba_games";
const CACHE_DATE_KEY = "cream11_nba_cache_date";

const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [lineup, setLineup] = useState<Lineup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const fetchLineup = useCallback(
    async (currentGame: Game) => {
      setLoading(true);
      setError(null);
      try {
        const generatedLineup = await generateFantasyLineup(currentGame);
        setLineup(generatedLineup);
        localStorage.setItem(
          `lineup-${gameId}`,
          JSON.stringify(generatedLineup)
        );
      } catch (e: any) {
        setError(e.message || "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    },
    [gameId]
  );

  const getCachedGames = (): Game[] | null => {
    try {
      const cachedGames = localStorage.getItem(GAMES_STORAGE_KEY);
      const cachedDate = localStorage.getItem(CACHE_DATE_KEY);

      if (cachedGames && cachedDate === new Date().toDateString()) {
        const parsedGamesData = JSON.parse(cachedGames);

        if (Array.isArray(parsedGamesData)) {
          return parsedGamesData;
        } else if (parsedGamesData.games) {
          return typeof parsedGamesData.games === "string"
            ? JSON.parse(parsedGamesData.games)
            : parsedGamesData.games;
        }
      }
    } catch (error) {
      console.error("Error reading cached games:", error);
    }
    return null;
  };

  useEffect(() => {
    const findGame = async () => {
      // First try to get from cache
      let games = getCachedGames();

      // If no cached games, fetch from API
      if (!games) {
        try {
          const { games: fetchedGames } = await fetchUpcomingGames();
          games = fetchedGames;
        } catch (error) {
          console.error("Error fetching games:", error);
          setError("Failed to load game data.");
          return;
        }
      }

      const foundGame = games.find((g) => g.id === gameId) || null;
      setGame(foundGame);

      if (foundGame) {
        const cachedLineup = localStorage.getItem(`lineup-${gameId}`);
        if (cachedLineup) {
          setLineup(JSON.parse(cachedLineup));
        } else {
          fetchLineup(foundGame);
        }
      } else {
        setError("Game not found.");
      }
    };

    findGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  if (!game && !loading && !error) {
    return (
      <div className="text-center text-white py-10">Searching for game...</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/"
        className="text-orange-400 hover:text-orange-300 mb-6 inline-block"
      >
        &larr; Back to Games
      </Link>

      {game && (
        <div className="bg-blue-900/30 rounded-xl shadow-lg p-6 mb-8 flex items-center justify-between border border-white/20">
          <div className="flex items-center gap-4">
            <img
              src={game.teamA.logo}
              alt={game.teamA.name}
              className="h-16 w-16"
            />
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {game.teamA.name}
            </h2>
          </div>
          <div className="text-center">
            <p className="text-4xl font-light text-gray-400">vs</p>
            <p className="text-sm text-gray-400">{game.date}</p>
          </div>
          <div className="flex items-center gap-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-right">
              {game.teamB.name}
            </h2>
            <img
              src={game.teamB.logo}
              alt={game.teamB.name}
              className="h-16 w-16"
            />
          </div>
        </div>
      )}

      {loading && <Loader message="Generating Cream11 Team..." />}

      {error && (
        <div className="text-center p-8 bg-red-900/50 border border-red-500 rounded-lg">
          <h3 className="text-2xl text-red-300 font-bold mb-2">
            Generation Failed
          </h3>
          <p className="text-red-300">{error}</p>
          <button
            onClick={() => game && fetchLineup(game)}
            className="mt-4 bg-orange-500 text-white font-bold py-2 px-4 rounded hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      )}

      {lineup && !loading && (
        <div className="animate-fade-in">
          {/* Basketball Court Visualization */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-orange-400 mb-4 text-center">
              Your Cream11 Team Formation
            </h3>
            <BasketballCourt lineup={lineup.lineup} />
          </div>

          {/* Summary Section with AI Analysis Button */}
          <div className="mb-8 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h3 className="text-2xl font-bold text-orange-400">
                Team Overview
              </h3>
              <button
                onClick={() => setShowAnalysisModal(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                View AI Analysis
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Salary Information */}
              <div className="bg-green-900/30 rounded-lg p-4 border border-green-500/30">
                <h4 className="text-green-400 font-semibold mb-2">
                  Salary Cap Usage
                </h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold text-lg">
                    ${lineup.totalSalary.toLocaleString()}
                  </span>
                  <span className="text-gray-400">
                    / ${SALARY_CAP.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${(lineup.totalSalary / SALARY_CAP) * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="text-gray-300 text-sm">
                  {((lineup.totalSalary / SALARY_CAP) * 100).toFixed(1)}% of
                  salary cap used
                </p>
              </div>

              {/* Position Distribution */}
              <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
                <h4 className="text-blue-400 font-semibold mb-3">
                  Position Distribution
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["PG", "SG", "SF", "PF", "C"].map((pos) => (
                    <div
                      key={pos}
                      className="flex items-center gap-2 bg-gray-700/50 px-3 py-2 rounded-full"
                    >
                      <PositionIcon position={pos} />
                      <span className="font-bold text-white text-sm">
                        {lineup.lineup.filter((p) => p.position === pos).length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Player Cards Grid */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Your Players</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {lineup.lineup.map((player) => (
                <PlayerCard key={player.name} player={player} />
              ))}
            </div>
          </div>

          {/* AI Analysis Modal */}
          <AIAnalysisModal
            lineup={lineup}
            isOpen={showAnalysisModal}
            onClose={() => setShowAnalysisModal(false)}
          />
        </div>
      )}
    </div>
  );
};

export default GamePage;
