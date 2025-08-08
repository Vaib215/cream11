import React from "react";
import type { Player } from "../types";
import { PositionIcon, StarIcon, ShieldIcon } from "./IconComponents";

interface BasketballCourtProps {
  lineup: Player[];
}

const BasketballCourt: React.FC<BasketballCourtProps> = ({ lineup }) => {
  const getRoleIcon = (player: Player) => {
    switch (player.role) {
      case "Captain":
        return (
          <ShieldIcon
            className="w-4 h-4 text-red-400"
            title="Captain (2x Points)"
          />
        );
      case "Star Player":
        return (
          <StarIcon
            className="w-4 h-4 text-yellow-400"
            title="Star Player (1.5x Points)"
          />
        );
      default:
        return null;
    }
  };

  // Position players on the half court based on the reference image
  const getPlayerPosition = (position: string, index: number) => {
    const positions: { [key: string]: { x: string; y: string } } = {
      PG: { x: "50%", y: "75%" }, // Point Guard - center court area
      SG: { x: "75%", y: "55%" }, // Shooting Guard - right side
      SF: { x: "25%", y: "35%" }, // Small Forward - left side
      PF: { x: "25%", y: "65%" }, // Power Forward - left low post
      C: { x: "50%", y: "25%" }, // Center - near the basket
    };

    // If multiple players of same position, adjust slightly
    const samePositionPlayers = lineup.filter((p) => p.position === position);
    if (samePositionPlayers.length > 1) {
      const playerIndex = samePositionPlayers.findIndex(
        (p) => p.name === lineup[index].name
      );
      const offset = (playerIndex - (samePositionPlayers.length - 1) / 2) * 8;
      return {
        x: `calc(${positions[position]?.x || "50%"} + ${offset}%)`,
        y: positions[position]?.y || "50%",
      };
    }

    return positions[position] || { x: "50%", y: "50%" };
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto mb-8">
      {/* Basketball Court Container */}
      <div
        className="relative bg-amber-800 rounded-2xl shadow-xl border border-orange-500 overflow-hidden"
        style={{ aspectRatio: "4/3" }}
      >
        {/* Court Markings */}
        <svg
          width="600"
          height="450"
          viewBox="0 0 600 450"
          className="w-full h-full"
        >
          <defs>
            {/* Wood texture pattern */}
            <pattern
              id="courtTexture"
              patternUnits="userSpaceOnUse"
              width="30"
              height="30"
            >
              <rect width="30" height="30" fill="#8B4513" />
              <rect x="0" y="0" width="15" height="15" fill="#A0522D" />
              <rect x="15" y="15" width="15" height="15" fill="#A0522D" />
              <rect
                x="7"
                y="7"
                width="15"
                height="15"
                fill="#CD853F"
                opacity="0.4"
              />
              <rect
                x="3"
                y="3"
                width="8"
                height="8"
                fill="#D2691E"
                opacity="0.6"
              />
              <rect
                x="18"
                y="18"
                width="8"
                height="8"
                fill="#D2691E"
                opacity="0.6"
              />
            </pattern>
          </defs>

          {/* Half court background with wood texture */}
          <rect
            x="10"
            y="10"
            width="580"
            height="430"
            fill="url(#courtTexture)"
            stroke="#FFFFFF"
            strokeWidth="8"
          />

          {/* Center line (half court line) */}
          <line
            x1="10"
            y1="350"
            x2="590"
            y2="350"
            stroke="#FFFFFF"
            strokeWidth="6"
          />

          {/* Center circle (partial) */}
          <path
            d="M 250 350 A 50 50 0 0 1 350 350"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="5"
          />

          {/* Three-point arc */}
          <path
            d="M 80 10 Q 300 180 520 10"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="6"
          />

          {/* Free throw lane (paint) */}
          <rect
            x="240"
            y="10"
            width="120"
            height="190"
            fill="rgba(255, 255, 255, 0.15)"
            stroke="#FFFFFF"
            strokeWidth="6"
          />

          {/* Free throw circle */}
          <circle
            cx="300"
            cy="200"
            r="60"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="5"
          />

          {/* Basket and backboard */}
          <rect
            x="275"
            y="6"
            width="50"
            height="6"
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth="3"
          />
          <circle
            cx="300"
            cy="25"
            r="12"
            fill="none"
            stroke="#FF4500"
            strokeWidth="6"
          />
          <circle
            cx="300"
            cy="25"
            r="8"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
          />

          {/* Side boundaries */}
          <line
            x1="10"
            y1="10"
            x2="10"
            y2="440"
            stroke="#FFFFFF"
            strokeWidth="8"
          />
          <line
            x1="590"
            y1="10"
            x2="590"
            y2="440"
            stroke="#FFFFFF"
            strokeWidth="8"
          />

          {/* Baseline */}
          <line
            x1="10"
            y1="10"
            x2="590"
            y2="10"
            stroke="#FFFFFF"
            strokeWidth="8"
          />

          {/* Free throw lane hash marks */}
          <line
            x1="232"
            y1="40"
            x2="248"
            y2="40"
            stroke="#FFFFFF"
            strokeWidth="5"
          />
          <line
            x1="232"
            y1="60"
            x2="248"
            y2="60"
            stroke="#FFFFFF"
            strokeWidth="5"
          />
          <line
            x1="232"
            y1="80"
            x2="248"
            y2="80"
            stroke="#FFFFFF"
            strokeWidth="5"
          />
          <line
            x1="232"
            y1="120"
            x2="248"
            y2="120"
            stroke="#FFFFFF"
            strokeWidth="5"
          />
          <line
            x1="232"
            y1="140"
            x2="248"
            y2="140"
            stroke="#FFFFFF"
            strokeWidth="5"
          />
          <line
            x1="232"
            y1="160"
            x2="248"
            y2="160"
            stroke="#FFFFFF"
            strokeWidth="5"
          />

          <line
            x1="352"
            y1="40"
            x2="368"
            y2="40"
            stroke="#FFFFFF"
            strokeWidth="5"
          />
          <line
            x1="352"
            y1="60"
            x2="368"
            y2="60"
            stroke="#FFFFFF"
            strokeWidth="5"
          />
          <line
            x1="352"
            y1="80"
            x2="368"
            y2="80"
            stroke="#FFFFFF"
            strokeWidth="5"
          />
          <line
            x1="352"
            y1="120"
            x2="368"
            y2="120"
            stroke="#FFFFFF"
            strokeWidth="5"
          />
          <line
            x1="352"
            y1="140"
            x2="368"
            y2="140"
            stroke="#FFFFFF"
            strokeWidth="5"
          />
          <line
            x1="352"
            y1="160"
            x2="368"
            y2="160"
            stroke="#FFFFFF"
            strokeWidth="5"
          />

          {/* Restricted Area (Paint arc) */}
          <path
            d="M 265 10 A 35 35 0 0 1 335 10"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="6"
          />

          {/* Three-point line corners */}
          <line
            x1="80"
            y1="10"
            x2="80"
            y2="120"
            stroke="#FFFFFF"
            strokeWidth="6"
          />
          <line
            x1="520"
            y1="10"
            x2="520"
            y2="120"
            stroke="#FFFFFF"
            strokeWidth="6"
          />

          {/* Additional court markings for visibility */}
          <line
            x1="240"
            y1="10"
            x2="240"
            y2="200"
            stroke="#FFFFFF"
            strokeWidth="6"
          />
          <line
            x1="360"
            y1="10"
            x2="360"
            y2="200"
            stroke="#FFFFFF"
            strokeWidth="6"
          />
          <line
            x1="240"
            y1="200"
            x2="360"
            y2="200"
            stroke="#FFFFFF"
            strokeWidth="6"
          />
        </svg>
      </div>

      {/* Player positions overlay */}
      <div className="absolute inset-0">
        {lineup.map((player, index) => {
          const position = getPlayerPosition(player.position, index);
          return (
            <div
              key={player.name}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{
                left: position.x,
                top: position.y,
              }}
            >
              {/* Player circle */}
              <div className="relative">
                <div className="w-18 h-18 bg-blue-600 rounded-full border-4 border-orange-500 shadow-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl group-hover:border-orange-400">
                  <PositionIcon position={player.position} />
                </div>

                {/* Role icon */}
                {player.role !== "Player" && (
                  <div className="absolute -top-1 -right-1 bg-white rounded-full p-1">
                    {getRoleIcon(player)}
                  </div>
                )}

                {/* Player info tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  <div className="bg-gray-900 text-white text-sm rounded-xl px-4 py-3 whitespace-nowrap shadow-2xl border-2 border-orange-500/50">
                    <div className="font-black text-orange-500">{player.name}</div>
                    <div className="text-gray-300 font-semibold">{player.team}</div>
                    <div className="text-green-400 font-bold">
                      💰 ${player.salary.toLocaleString()}
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BasketballCourt;
