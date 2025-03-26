"use client";

import { MatchTeams } from "@/components/match-teams";

interface TeamsSectionProps {
  teams: Record<string, any>;
  teamNames: string[];
}

export function TeamsSection({ teams, teamNames }: TeamsSectionProps) {
  return (
    <div className="mb-10">
      <h3 className="text-xl font-bold mb-5 text-gray-800 dark:text-gray-100 flex items-center">
        <span className="inline-block w-8 h-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded mr-3"></span>
        Today&apos;s Playing XI
      </h3>
      <MatchTeams teams={teams} teamNames={teamNames} />
    </div>
  );
}
