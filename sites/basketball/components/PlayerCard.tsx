import React from "react";
import type { Player } from "../types";
import { PositionIcon, StarIcon, ShieldIcon } from "./IconComponents";
import { SALARY_CAP } from "../constants";

const PlayerCard = ({ player }: { player: Player }) => {
  const getRoleIcon = () => {
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

  const getRoleLabel = () => {
    switch (player.role) {
      case "Captain":
        return {
          label: "Captain",
          color: "text-red-400",
          bg: "bg-red-900/30",
          border: "border-red-500/30",
        };
      case "Star Player":
        return {
          label: "Star",
          color: "text-yellow-400",
          bg: "bg-yellow-900/30",
          border: "border-yellow-500/30",
        };
      default:
        return {
          label: "Player",
          color: "text-gray-400",
          bg: "bg-gray-900/30",
          border: "border-gray-500/30",
        };
    }
  };

  const salaryPercentage = ((player.salary / (SALARY_CAP / 8)) * 100).toFixed(
    0
  );
  const roleInfo = getRoleLabel();

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-lg p-5 flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-orange-400/50 group">
      {/* Header with Position and Role */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <PositionIcon position={player.position} />
            {player.role !== "Player" && (
              <div className="absolute -top-1 -right-1">{getRoleIcon()}</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-white text-lg leading-tight truncate group-hover:text-orange-300 transition-colors">
              {player.name}
            </h3>
            <p className="text-gray-400 text-sm">{player.team}</p>
          </div>
        </div>

        {/* Role Badge */}
        <div
          className={`${roleInfo.bg} ${roleInfo.border} border px-2 py-1 rounded-full flex items-center gap-1 shrink-0`}
        >
          <span className={`${roleInfo.color} text-xs font-semibold`}>
            {roleInfo.label}
          </span>
        </div>
      </div>

      {/* Salary Display */}
      <div className="mb-4">
        <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3 text-center">
          <div className="text-green-400 font-black text-xl">
            ${player.salary.toLocaleString()}
          </div>
          <div className="text-gray-400 text-xs mt-1">
            {salaryPercentage}% of avg. budget
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="flex-grow mb-4">
        <div className="bg-gray-900/50 rounded-lg p-3 h-full">
          <h4 className="text-orange-400 font-semibold text-sm mb-2">
            <a href="https://cream11.live" target="_blank" rel="noopener noreferrer" className="hover:text-orange-300 transition-colors">Cream11</a> Analysis:
          </h4>
          <p className="text-gray-300 text-sm leading-relaxed italic line-clamp-4">
            "{player.analysis}"
          </p>
        </div>
      </div>

      {/* Salary Progress Bar */}
      <div className="mt-auto">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Salary Impact</span>
          <span>{salaryPercentage}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(parseInt(salaryPercentage), 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
