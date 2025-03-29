"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Player } from "@/types/player";
import { FantasyTeamResult } from "@/types/match";
import { FantasyTeamBuilder } from "@/components/fantasy-team-builder";
import { TeamPerformanceMetrics } from "@/components/team-performance-metrics";
import { TeamAnalysis } from "@/components/team-analysis";
import { analyzeTeam } from "@/app/actions";
import { Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FantasyTeamSectionProps {
  allPlayers: Player[];
  aiSuggestedTeam?: FantasyTeamResult;
}

export function FantasyTeamSection({
  allPlayers,
  aiSuggestedTeam,
}: FantasyTeamSectionProps) {
  const [reanalyzing, setReanalyzing] = useState(false);
  const [totalCredits, setTotalCredits] = useState(0);
  const [fantasyTeam, setFantasyTeam] = useState<Player[]>([]);
  const [needsReanalysis, setNeedsReanalysis] = useState(false);
  const [stats, setStats] = useState({
    winProbability: 0,
    battingStrength: 0,
    bowlingStrength: 0,
    balanceRating: 0,
  });

  // Initialize stats and team from aiSuggestedTeam when component mounts
  useEffect(() => {
    if (aiSuggestedTeam) {
      // Set initial stats
      setStats({
        winProbability: aiSuggestedTeam.teamStats?.winProbability || 50,
        battingStrength: aiSuggestedTeam.teamStats?.battingStrength || 60,
        bowlingStrength: aiSuggestedTeam.teamStats?.bowlingStrength || 60,
        balanceRating: aiSuggestedTeam.teamStats?.balanceRating || 55,
      });

      // Set initial team if available
      if (aiSuggestedTeam.selectedPlayers?.length) {
        // Filter out any players not in current match's roster
        const validPlayers = aiSuggestedTeam.selectedPlayers.filter(player =>
          allPlayers.some(p => p.name === player.name)
        );

        if (validPlayers.length !== aiSuggestedTeam.selectedPlayers.length) {
          console.error('Invalid players in AI suggestion:',
            aiSuggestedTeam.selectedPlayers.filter(p =>
              !allPlayers.some(ap => ap.name === p.name)
            )
          );
        }

        const initialTeam = validPlayers.map(player => ({
          ...player,
          isCaptain: player.name === aiSuggestedTeam.captain,
          isViceCaptain: player.name === aiSuggestedTeam.viceCaptain,
        }));
        // @ts-expect-error - initialTeam is of type Player[]
        setFantasyTeam(initialTeam);
        setTotalCredits(initialTeam.reduce((sum, p) => sum + (p.credits || 0), 0));
      }
    }
  }, [aiSuggestedTeam, allPlayers]);

  // Function to create a suggested best 11 players
  const createSuggestedBest11 = useCallback((): Player[] => {
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
  }, [allPlayers]);

  // Create the initial fantasy team
  const initialTeam = useMemo(() => {
    // If we have an AI suggested team, use it
    if (
      aiSuggestedTeam?.selectedPlayers &&
      aiSuggestedTeam.selectedPlayers.length > 0
    ) {
      const aiPlayers = aiSuggestedTeam.selectedPlayers
        .map(
          (aiPlayer: {
            name: string;
            isCaptain?: boolean;
            isViceCaptain?: boolean;
          }) => {
            const player = allPlayers.find((p) => p.name === aiPlayer.name);
            if (player) {
              return {
                ...player,
                isCaptain:
                  aiPlayer.isCaptain ||
                  player.name === aiSuggestedTeam?.captain,
                isViceCaptain:
                  aiPlayer.isViceCaptain ||
                  player.name === aiSuggestedTeam?.viceCaptain,
              };
            }
            return null;
          }
        )
        .filter(Boolean) as Player[];

      if (aiPlayers.length === 11) {
        return aiPlayers;
      }
    }

    return createSuggestedBest11();
  }, [aiSuggestedTeam, allPlayers, createSuggestedBest11]);

  // Calculate stats based on team composition - keeping this for fallback
  const calculateAndSetStats = useCallback(
    (team: Player[]) => {
      if (team.length === 0) {
        setStats({
          winProbability: 0,
          battingStrength: 0,
          bowlingStrength: 0,
          balanceRating: 0,
        });
        return;
      }

      // If AI stats are available, use them as a base
      const baseStats = aiSuggestedTeam?.teamStats || {
        winProbability: 0,
        battingStrength: 0,
        bowlingStrength: 0,
        balanceRating: 0,
      };

      // Calculate new stats...
      const winProb = baseStats.winProbability || Math.random() * 100;
      const battingStrength = baseStats.battingStrength || Math.random() * 100;
      const bowlingStrength = baseStats.bowlingStrength || Math.random() * 100;
      const balance = baseStats.balanceRating || Math.random() * 100;

      setStats({
        winProbability: Math.round(winProb),
        battingStrength: Math.round(battingStrength),
        bowlingStrength: Math.round(bowlingStrength),
        balanceRating: Math.round(balance),
      });
    },
    [aiSuggestedTeam?.teamStats]
  );

  // Update team, credits, and stats when team changes
  const handleFantasyTeamChange = useCallback(
    (newTeam: Player[]) => {
      setFantasyTeam(newTeam);

      // Calculate total credits
      const credits = newTeam.reduce(
        (total, player) => total + (player.credits || 0),
        0
      );
      setTotalCredits(credits);

      // Check if team differs from AI suggestion
      if (aiSuggestedTeam?.selectedPlayers) {
        // First check if team sizes match
        if (aiSuggestedTeam.selectedPlayers.length !== newTeam.length) {
          setNeedsReanalysis(true);
          calculateAndSetStats(newTeam);
          return;
        }

        // Check if all players match exactly including their roles
        const teamDiffers = !newTeam.every((player) => {
          const aiPlayer = aiSuggestedTeam.selectedPlayers.find(
            (p) => p.name === player.name
          );
          return (
            aiPlayer &&
            aiPlayer.isCaptain === player.isCaptain &&
            aiPlayer.isViceCaptain === player.isViceCaptain &&
            aiPlayer.role === player.role
          );
        });

        setNeedsReanalysis(teamDiffers);

        // If team matches AI suggestion exactly, use AI stats
        if (!teamDiffers && aiSuggestedTeam.teamStats) {
          setStats({
            winProbability: aiSuggestedTeam.teamStats.winProbability,
            battingStrength: aiSuggestedTeam.teamStats.battingStrength,
            bowlingStrength: aiSuggestedTeam.teamStats.bowlingStrength,
            balanceRating: aiSuggestedTeam.teamStats.balanceRating,
          });
        } else {
          // Calculate stats for modified team
          calculateAndSetStats(newTeam);
        }
      } else {
        // If no AI suggestion available, just calculate stats
        calculateAndSetStats(newTeam);
      }
    },
    [calculateAndSetStats, aiSuggestedTeam]
  );

  // Reset team to a basic suggested team
  const resetFantasyTeam = useCallback(() => {
    const suggestedTeam = createSuggestedBest11();
    handleFantasyTeamChange(suggestedTeam);
  }, [createSuggestedBest11, handleFantasyTeamChange]);

  // Function to reanalyze the modified team
  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      const aiSuggestedTeamPlayers =
        aiSuggestedTeam?.selectedPlayers as Player[];
      const result = await analyzeTeam(fantasyTeam, aiSuggestedTeamPlayers);

      if (result?.teamStats) {
        setStats({
          winProbability: result.teamStats.winProbability,
          battingStrength: result.teamStats.battingStrength,
          bowlingStrength: result.teamStats.bowlingStrength,
          balanceRating: result.teamStats.balanceRating,
        });
        setNeedsReanalysis(false);
      }
    } catch (error) {
      console.error("Failed to reanalyze team:", error);
    } finally {
      setReanalyzing(false);
    }
  };

  // Initialize team and stats on component mount
  useEffect(() => {
    // Set initial credits if AI team is available
    if (
      aiSuggestedTeam?.selectedPlayers &&
      aiSuggestedTeam.selectedPlayers.length > 0 &&
      aiSuggestedTeam.totalCredits
    ) {
      setTotalCredits(aiSuggestedTeam.totalCredits);
    } else {
      // Calculate credits for the team
      const credits = initialTeam.reduce(
        (total, player) => total + (player.credits || 0),
        0
      );
      setTotalCredits(credits);
    }

    // Set the initial fantasy team
    setFantasyTeam(initialTeam);

    // Use AI stats if available, otherwise calculate
    if (aiSuggestedTeam?.teamStats) {
      setStats({
        winProbability: aiSuggestedTeam.teamStats.winProbability,
        battingStrength: aiSuggestedTeam.teamStats.battingStrength,
        bowlingStrength: aiSuggestedTeam.teamStats.bowlingStrength,
        balanceRating: aiSuggestedTeam.teamStats.balanceRating,
      });
    } else {
      // Calculate stats based on the team composition
      calculateAndSetStats(initialTeam);
    }
  }, [initialTeam, aiSuggestedTeam, calculateAndSetStats]);

  return (
    <div className="grid md:grid-cols-7 gap-4 md:gap-6">
      {/* Left section - Team Builder */}
      <div className="md:col-span-4 space-y-4">
        {/* Fantasy Team Builder */}
        <FantasyTeamBuilder
          allPlayers={allPlayers}
          fantasyTeam={fantasyTeam}
          onFantasyTeamChange={handleFantasyTeamChange}
        />

        {/* Mobile Stats & Analysis Section */}
        <div className="block md:hidden space-y-4">
          {/* Controls */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={resetFantasyTeam}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <RefreshCcw className="h-4 w-4" />
              Reset Team
            </Button>
            {needsReanalysis && (
              <Button
                onClick={handleReanalyze}
                disabled={reanalyzing}
                className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600"
              >
                {reanalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Team"
                )}
              </Button>
            )}
          </div>

          {/* Credits Display */}
          <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/30">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Credits
              </span>
              <span
                className={`font-bold ${totalCredits > 100
                  ? "text-red-500"
                  : "text-gray-900 dark:text-gray-100"
                  }`}
              >
                {totalCredits.toFixed(1)}/100.0
              </span>
            </div>
            <div className="mt-2 h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${totalCredits > 100
                  ? "bg-red-500"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  }`}
                style={{ width: `${Math.min(totalCredits, 100)}%` }}
              />
            </div>
          </div>

          {/* Mobile Performance Metrics */}
          <TeamPerformanceMetrics
            winProbability={stats.winProbability}
            battingStrength={stats.battingStrength}
            bowlingStrength={stats.bowlingStrength}
            balanceRating={stats.balanceRating}
          />

          {/* Mobile Team Analysis */}
          <TeamAnalysis
            analysis={
              aiSuggestedTeam?.teamAnalysis ||
              "No analysis available yet. Select your team and click Analyze."
            }
            isLoading={reanalyzing}
          />
        </div>
      </div>

      {/* Right section - Stats & Controls (desktop only) */}
      <div className={cn(
        "hidden md:block md:col-span-3 space-y-4 md:space-y-6",
        reanalyzing && "blur-sm"
      )}>
        {/* Desktop Controls */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={resetFantasyTeam}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <RefreshCcw className="h-4 w-4" />
            Reset Team
          </Button>
          {needsReanalysis && (
            <Button
              onClick={handleReanalyze}
              disabled={reanalyzing}
              className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600"
            >
              {reanalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Team"
              )}
            </Button>
          )}
        </div>

        {/* Desktop Stats Section */}
        <div className="space-y-4">
          {/* Credits Display */}
          <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/30">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Credits
              </span>
              <span
                className={`font-bold ${totalCredits > 100
                  ? "text-red-500"
                  : "text-gray-900 dark:text-gray-100"
                  }`}
              >
                {totalCredits.toFixed(1)}/100.0
              </span>
            </div>
            <div className="mt-2 h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${totalCredits > 100
                  ? "bg-red-500"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  }`}
                style={{ width: `${Math.min(totalCredits, 100)}%` }}
              />
            </div>
          </div>

          {/* Desktop Performance Metrics */}
          <TeamPerformanceMetrics
            winProbability={stats.winProbability}
            battingStrength={stats.battingStrength}
            bowlingStrength={stats.bowlingStrength}
            balanceRating={stats.balanceRating}
          />

          {/* Desktop Team Analysis */}
          <TeamAnalysis
            analysis={
              aiSuggestedTeam?.teamAnalysis ||
              "No analysis available yet. Select your team and click Analyze."
            }
            isLoading={reanalyzing}
          />
        </div>
      </div>
    </div>
  );
}
