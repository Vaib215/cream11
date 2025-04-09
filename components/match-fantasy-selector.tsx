"use client";

import { useState, useMemo } from "react";
import { FantasyTeamSection } from "@/components/fantasy-team-section";
import { Player } from "@/types/player";
import { MatchWithPlayers } from "@/types/match";

interface MatchFantasySelectorProps {
  allMatchesData: MatchWithPlayers[];
}

export function MatchFantasySelector({
  allMatchesData,
}: MatchFantasySelectorProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    allMatchesData[0]?.id || ""
  );

  // Memoize the derivation of players for the selected match to avoid recalculating on every render
  const selectedMatchDataAndPlayers = useMemo(() => {
    // Default to first match if no match is found with the selected ID
    const match =
      allMatchesData.find((m) => m.id === selectedMatchId) || allMatchesData[0];
    const players: Player[] = [
      ...(match.teams[match.home]?.players || []),
      ...(match.teams[match.away]?.players || []),
    ];
    return { match, players };
  }, [selectedMatchId, allMatchesData]);

  // Early return after the hook definition
  if (!allMatchesData || allMatchesData.length === 0) {
    return <div>Error: No match data provided.</div>;
  }

  const { match: selectedMatchData, players: allPlayersForSelectedMatch } =
    selectedMatchDataAndPlayers;

  return (
    <div className="w-full p-4">
      <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4 h-auto">
        {allMatchesData.map((match) => (
          <button
            key={match.id}
            onClick={() => setSelectedMatchId(match.id)}
            className={`flex flex-1 flex-col items-center justify-center p-3 h-auto text-sm rounded-lg border transition-colors ${
              selectedMatchId === match.id
                ? "bg-indigo-100 border-indigo-300 shadow-sm dark:bg-indigo-900/50 dark:border-indigo-700"
                : "bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700/50"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{match.home}</span>
              </div>
              <span className="text-gray-500">vs</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{match.away}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {match.startTime} - {match.venue}
            </div>
          </button>
        ))}
      </div>

      {/* Render content for the selected match */}
      <div className="mt-0">
        <FantasyTeamSection
          key={selectedMatchData.id} // Use selected match ID as key
          allPlayers={allPlayersForSelectedMatch} // Pass players for the selected match
          aiSuggestedTeam={selectedMatchData.aiSuggestedTeam}
        />
      </div>
    </div>
  );
}
