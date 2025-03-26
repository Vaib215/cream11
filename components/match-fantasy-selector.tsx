"use client";

import { useMemo } from "react";
import { MatchHeader } from "@/components/match-header";
import { TeamsSection } from "@/components/teams-section";
import { FantasyTeamSection } from "@/components/fantasy-team-section";
import { MatchWithPlayers } from "@/types/match";

interface MatchFantasySelectorProps {
  match: MatchWithPlayers;
}

export function MatchFantasySelector({ match }: MatchFantasySelectorProps) {
  const teamNames = Object.keys(match.teams);

  // Memoize allPlayers to prevent recalculation on every render
  const allPlayers = useMemo(
    () => [
      ...match.teams[teamNames[0]].players.map((player) => ({
        ...player,
        team: teamNames[0],
        teamColor: match.teams[teamNames[0]].color,
        credits: player.credits || Math.floor(Math.random() * 5) + 6, // Default credits between 6-10
      })),
      ...match.teams[teamNames[1]].players.map((player) => ({
        ...player,
        team: teamNames[1],
        teamColor: match.teams[teamNames[1]].color,
        credits: player.credits || Math.floor(Math.random() * 5) + 6, // Default credits between 6-10
      })),
    ],
    [match.teams, teamNames]
  );

  return (
    <div>
      <MatchHeader teamNames={teamNames} match={match} />

      {/* Match Content */}
      <div className="p-8">
        <TeamsSection teams={match.teams} teamNames={teamNames} />

        <FantasyTeamSection
          allPlayers={allPlayers}
          aiSuggestedTeam={match.aiSuggestedTeam}
        />
      </div>
    </div>
  );
}
