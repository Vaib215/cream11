"use client";

import { useState } from "react";
import { Clock, MapPin, RefreshCw } from "lucide-react";
import { MatchTeams } from "@/components/match-teams";
import { FantasyTeamBuilder } from "@/components/fantasy-team-builder";
import { TeamStats } from "@/components/team-stats";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import dayjs from "dayjs";
import { Player, PlayerDetails } from "@/types/player";

interface MatchFantasySelectorProps {
  match: {
    id: string;
    teams: Record<
      string,
      {
        players: PlayerDetails[];
        color: string;
        secondaryColor: string;
        logo?: string;
      }
    >;
    venue: string;
    startTime: string;
    date: string;
  };
}

export function MatchFantasySelector({ match }: MatchFantasySelectorProps) {
  const teamNames = Object.keys(match.teams);

  const allPlayers: Player[] = [
    ...match.teams[teamNames[0]].players.map((player) => ({
      ...player,
      team: teamNames[0],
      teamColor: match.teams[teamNames[0]].color,
    })),
    ...match.teams[teamNames[1]].players.map((player) => ({
      ...player,
      team: teamNames[1],
      teamColor: match.teams[teamNames[1]].color,
    })),
  ];

  // Create a diverse suggested best 11 based on roles
  const createSuggestedBest11 = (): Player[] => {
    // Wicket Keepers (1-2)
    const wicketKeepers = allPlayers
      .filter((p) => p.role === "WICKET_KEEPER")
      .slice(0, 1);

    // Batters (3-5)
    const batters = allPlayers.filter((p) => p.role === "BATTER").slice(0, 4);

    // All Rounders (2-3)
    const allRounders = allPlayers
      .filter((p) => p.role === "ALL_ROUNDER")
      .slice(0, 3);

    // Bowlers (3-4)
    const bowlers = allPlayers.filter((p) => p.role === "BOWLER").slice(0, 3);

    // Fill remaining spots
    const remaining =
      11 -
      (wicketKeepers.length +
        batters.length +
        allRounders.length +
        bowlers.length);

    const additionalPlayers = allPlayers
      .filter(
        (p) =>
          !wicketKeepers.some((wk) => wk.name === p.name) &&
          !batters.some((b) => b.name === p.name) &&
          !allRounders.some((ar) => ar.name === p.name) &&
          !bowlers.some((b) => b.name === p.name)
      )
      .slice(0, remaining);

    return [
      ...wicketKeepers,
      ...batters,
      ...allRounders,
      ...bowlers,
      ...additionalPlayers,
    ];
  };

  const [fantasyTeam, setFantasyTeam] = useState<Player[]>(
    createSuggestedBest11()
  );

  const [stats, setStats] = useState({
    winProbability: 68,
    battingStrength: 75,
    bowlingStrength: 82,
    balanceRating: 79,
  });

  const handleFantasyTeamChange = (newTeam: Player[]) => {
    setFantasyTeam(newTeam);

    // Calculate new stats based on team composition
    const numBatters = newTeam.filter((p) => p.role === "BATTER").length;
    const numBowlers = newTeam.filter((p) => p.role === "BOWLER").length;
    const numAllRounders = newTeam.filter(
      (p) => p.role === "ALL_ROUNDER"
    ).length;
    const numWicketKeepers = newTeam.filter(
      (p) => p.role === "WICKET_KEEPER"
    ).length;

    // Balance is best when we have a good mix
    const balance = Math.min(
      100,
      60 +
        (numWicketKeepers > 0 ? 10 : 0) +
        (numBatters > 2 ? 10 : 0) +
        (numBowlers > 2 ? 10 : 0) +
        (numAllRounders > 1 ? 10 : 0)
    );

    // Calculate batting strength based mainly on batters and all-rounders
    const battingStrength = Math.min(
      100,
      50 + numBatters * 5 + numAllRounders * 3 + numWicketKeepers * 2
    );

    // Calculate bowling strength based mainly on bowlers and all-rounders
    const bowlingStrength = Math.min(
      100,
      50 + numBowlers * 5 + numAllRounders * 3
    );

    // Win probability is a weighted average of the other stats with some randomness
    const winProb = Math.min(
      100,
      battingStrength * 0.35 +
        bowlingStrength * 0.35 +
        balance * 0.3 +
        (Math.random() * 10 - 5)
    );

    setStats({
      winProbability: Math.round(winProb),
      battingStrength: Math.round(battingStrength),
      bowlingStrength: Math.round(bowlingStrength),
      balanceRating: Math.round(balance),
    });
  };

  const resetFantasyTeam = () => {
    const suggestedTeam = createSuggestedBest11();
    setFantasyTeam(suggestedTeam);

    setStats({
      winProbability: 68,
      battingStrength: 75,
      bowlingStrength: 82,
      balanceRating: 79,
    });
  };

  return (
    <div>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 opacity-90"></div>
        <div className="relative z-10 p-8 text-white">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex-1 flex justify-center items-center md:justify-start">
              {match.teams[teamNames[0]].logo && (
                <div className="relative h-18 w-18 p-1.5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                  <Image
                    src={match.teams[teamNames[0]].logo as string}
                    alt={`${teamNames[0]} logo`}
                    width={60}
                    height={60}
                    className="object-contain"
                  />
                </div>
              )}
              <div className="hidden md:block ml-3">
                <h4 className="font-bold text-3xl">{teamNames[0]}</h4>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="relative mx-auto px-4 py-1 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 mb-3">
                <span className="font-bold text-3xl">VS</span>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"></div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center text-indigo-100 justify-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">{match.venue}</span>
                </div>
                <div className="flex items-center text-indigo-100 justify-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    {dayjs(match.date).format("MMM D, YYYY")} at{" "}
                    {match.startTime}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex justify-center items-center md:justify-end">
              <div className="hidden md:block mr-3 text-right">
                <h4 className="font-bold text-3xl">{teamNames[1]}</h4>
              </div>
              {match.teams[teamNames[1]].logo && (
                <div className="relative h-18 w-18 p-1.5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                  <Image
                    src={match.teams[teamNames[1]].logo as string}
                    alt={`${teamNames[1]} logo`}
                    width={60}
                    height={60}
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600"></div>
      </div>

      {/* Match Content */}
      <div className="p-8">
        {/* Teams Section */}
        <div className="mb-10">
          <h3 className="text-xl font-bold mb-5 text-gray-800 dark:text-gray-100 flex items-center">
            <span className="inline-block w-8 h-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded mr-3"></span>
            Today&apos;s Playing XI
          </h3>
          <MatchTeams teams={match.teams} teamNames={teamNames} />
        </div>

        {/* Fantasy Team Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              <span className="inline-block w-8 h-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded mr-3"></span>
              Your Cream 11 Fantasy Team
            </h3>
            <Button
              onClick={resetFantasyTeam}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600"
            >
              <RefreshCw className="h-4 w-4" />
              Reset to Suggested XI
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <FantasyTeamBuilder
              allPlayers={allPlayers}
              fantasyTeam={fantasyTeam}
              onFantasyTeamChange={handleFantasyTeamChange}
            />
            <TeamStats stats={stats} />
          </div>
        </div>
      </div>
    </div>
  );
}
