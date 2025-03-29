"use client";

import { useMemo } from "react";
import { FantasyTeamSection } from "@/components/fantasy-team-section";
import { MatchWithPlayers } from "@/types/match";
import { MatchTeams } from "./match-teams";

interface MatchFantasySelectorProps {
  match: MatchWithPlayers;
}

export function MatchFantasySelector({ match }: MatchFantasySelectorProps) {
  const teamNames = Object.keys(match.teams);

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
    <div className="flex flex-col h-full gap-4 p-4">
      <FantasyTeamSection
        allPlayers={allPlayers}
        aiSuggestedTeam={match.aiSuggestedTeam}
      />

      <MatchTeams teams={match.teams} teamNames={teamNames} />
    </div>
  );
}
