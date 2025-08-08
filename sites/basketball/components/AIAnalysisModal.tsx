import React from "react";
import type { Lineup } from "../types";
import { PositionIcon, StarIcon, ShieldIcon } from "./IconComponents";
import { SALARY_CAP } from "../constants";

interface AIAnalysisModalProps {
  lineup: Lineup;
  isOpen: boolean;
  onClose: () => void;
}

const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({
  lineup,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
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

  const getRoleMultiplier = (role: string) => {
    switch (role) {
      case "Captain":
        return "2x";
      case "Star Player":
        return "1.5x";
      default:
        return "1x";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Captain":
        return "text-red-400";
      case "Star Player":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-white/20 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-orange-400">
            AI Lineup Analysis
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Overall Strategy */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">
              Overall Strategy
            </h3>
            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
              <p className="text-gray-300 leading-relaxed">
                {lineup.reasoning}
              </p>
            </div>
          </div>

          {/* Team Composition */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">
              Team Composition
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              {["PG", "SG", "SF", "PF", "C"].map((pos) => {
                const count = lineup.lineup.filter(
                  (p) => p.position === pos
                ).length;
                return (
                  <div
                    key={pos}
                    className="bg-gray-800/50 rounded-lg p-3 text-center"
                  >
                    <PositionIcon position={pos} />
                    <div className="mt-2">
                      <div className="text-white font-bold">{pos}</div>
                      <div className="text-gray-400 text-sm">
                        {count} player{count !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Salary Summary */}
            <div className="bg-green-900/30 rounded-lg p-4 border border-green-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">Total Salary:</span>
                <span className="text-green-400 font-bold text-lg">
                  ${lineup.totalSalary.toLocaleString()} / $
                  {SALARY_CAP.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${(lineup.totalSalary / SALARY_CAP) * 100}%`,
                  }}
                ></div>
              </div>
              <div className="text-gray-400 text-sm mt-1">
                {((lineup.totalSalary / SALARY_CAP) * 100).toFixed(1)}% of
                salary cap used
              </div>
            </div>
          </div>

          {/* Player Analysis */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              Player-wise Analysis
            </h3>
            <div className="space-y-4">
              {lineup.lineup.map((player, index) => (
                <div
                  key={player.name}
                  className="bg-gray-800/50 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <PositionIcon position={player.position} />
                      <div>
                        <h4 className="font-bold text-white text-lg">
                          {player.name}
                        </h4>
                        <p className="text-gray-400">
                          {player.team} • {player.position}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        {getRoleIcon(player.role)}
                        <span
                          className={`font-bold ${getRoleColor(player.role)}`}
                        >
                          {player.role} ({getRoleMultiplier(player.role)})
                        </span>
                      </div>
                      <div className="text-green-400 font-bold text-lg">
                        ${player.salary.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <h5 className="text-orange-400 font-semibold mb-2">
                      <a href="https://cream11.live" target="_blank" rel="noopener noreferrer" className="hover:text-orange-300 transition-colors">Cream11</a> Analysis:
                    </h5>
                    <p className="text-gray-300 text-sm leading-relaxed italic">
                      "{player.analysis}"
                    </p>
                  </div>

                  {/* Salary percentage bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Salary Impact</span>
                      <span>
                        {((player.salary / lineup.totalSalary) * 100).toFixed(
                          1
                        )}
                        % of total
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            (player.salary / lineup.totalSalary) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-white/20 p-6">
          <button
            onClick={onClose}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisModal;
