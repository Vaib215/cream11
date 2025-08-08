import React from "react";
import { useNavigate } from "react-router-dom";
import type { Game } from "../types";

const GameCard = ({ game }: { game: Game }) => {
  const navigate = useNavigate();

  const handleGenerate = () => {
    navigate(`/game/${game.id}`);
  };

  return (
    <div className="p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl border border-gray-600 bg-gray-800">
      <div>
        <div className="text-center mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
          <p className="text-sm font-semibold text-white mb-1">
            📅 {game.date} • {game.time}
          </p>
          <p className="text-xs font-semibold text-orange-500">
            🏟️ {game.arena}
          </p>
        </div>
        <div className="flex justify-around items-center text-center">
          <div className="flex flex-col items-center w-1/3">
            <div className="relative mb-3">
              <img
                src={game.teamA.logo}
                alt={`${game.teamA.name} logo`}
                className="h-20 w-20 md:h-24 md:w-24 object-contain"
              />
            </div>
            <h3 className="font-bold text-lg md:text-xl text-white">
              {game.teamA.name}
            </h3>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-5xl font-black text-white">VS</div>
            <div className="text-xs text-orange-500 font-bold mt-1">🏀 NBA</div>
          </div>
          <div className="flex flex-col items-center w-1/3">
            <div className="relative mb-3">
              <img
                src={game.teamB.logo}
                alt={`${game.teamB.name} logo`}
                className="h-20 w-20 md:h-24 md:w-24 object-contain"
              />
            </div>
            <h3 className="font-bold text-lg md:text-xl text-white">
              {game.teamB.name}
            </h3>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <button
          onClick={handleGenerate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-colors duration-300 text-lg"
        >
          GENERATE CHAMPIONSHIP LINEUP
        </button>
      </div>
    </div>
  );
};

export default GameCard;
