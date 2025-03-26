"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Player } from "@/types/player";
import { FantasyTeamResult } from "@/types/match";
import { FantasyTeamBuilder } from "@/components/fantasy-team-builder";
import { TeamStats } from "@/components/team-stats";
import { FantasyTeamControls } from "@/components/fantasy-team-controls";

interface FantasyTeamSectionProps {
  allPlayers: Player[];
  aiSuggestedTeam?: FantasyTeamResult;
}

export function FantasyTeamSection({
  allPlayers,
  aiSuggestedTeam,
}: FantasyTeamSectionProps) {
  const [loading, setLoading] = useState(false);
  const [totalCredits, setTotalCredits] = useState(0);
  const [fantasyTeam, setFantasyTeam] = useState<Player[]>([]);
  const [stats, setStats] = useState({
    winProbability: 0,
    battingStrength: 0,
    bowlingStrength: 0,
    balanceRating: 0,
  });

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

    // Fall back to basic suggestion if AI team is not available
    return createSuggestedBest11();
  }, [aiSuggestedTeam, allPlayers, createSuggestedBest11]);

  // Calculate stats based on team composition - keeping this for fallback
  const calculateAndSetStats = useCallback(
    (team: Player[]) => {
      // If AI stats are available, use them
      if (aiSuggestedTeam?.teamStats) {
        setStats({
          winProbability: aiSuggestedTeam.teamStats.winProbability,
          battingStrength: aiSuggestedTeam.teamStats.battingStrength,
          bowlingStrength: aiSuggestedTeam.teamStats.bowlingStrength,
          balanceRating: aiSuggestedTeam.teamStats.balanceRating,
        });
        return;
      }

      // Fall back to calculation if AI stats aren't available
      const numBatters = team.filter((p) => p.role === "BATTER").length;
      const numBowlers = team.filter((p) => p.role === "BOWLER").length;
      const numAllRounders = team.filter(
        (p) => p.role === "ALL_ROUNDER"
      ).length;
      const numWicketKeepers = team.filter(
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

      // Win probability is a weighted average of the other stats
      const winProb = Math.min(
        100,
        battingStrength * 0.35 + bowlingStrength * 0.35 + balance * 0.3
      );

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

      // Calculate stats
      calculateAndSetStats(newTeam);
    },
    [calculateAndSetStats]
  );

  // Reset team to a basic suggested team
  const resetFantasyTeam = useCallback(() => {
    const suggestedTeam = createSuggestedBest11();
    handleFantasyTeamChange(suggestedTeam);
  }, [createSuggestedBest11, handleFantasyTeamChange]);

  // Use AI suggested team if available
  const useAITeam = useCallback(() => {
    setLoading(true);

    try {
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

        if (aiPlayers.length > 0) {
          setFantasyTeam(aiPlayers);

          if (aiSuggestedTeam.totalCredits) {
            setTotalCredits(aiSuggestedTeam.totalCredits);
          } else {
            // Calculate credits manually if not provided
            const credits = aiPlayers.reduce(
              (total, player) => total + (player.credits || 0),
              0
            );
            setTotalCredits(credits);
          }

          // Update stats based on AI team
          if (aiSuggestedTeam.teamStats) {
            setStats({
              winProbability: aiSuggestedTeam.teamStats.winProbability,
              battingStrength: aiSuggestedTeam.teamStats.battingStrength,
              bowlingStrength: aiSuggestedTeam.teamStats.bowlingStrength,
              balanceRating: aiSuggestedTeam.teamStats.balanceRating,
            });
          } else {
            // Fall back to calculation if AI stats are not available
            calculateAndSetStats(aiPlayers);
          }
        }
      }
    } catch (error) {
      console.error("Failed to apply AI team:", error);
    } finally {
      setLoading(false);
    }
  }, [aiSuggestedTeam, allPlayers, calculateAndSetStats]);

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
    <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
      <FantasyTeamControls
        totalCredits={totalCredits}
        loading={loading}
        onUseAITeam={useAITeam}
        onResetTeam={resetFantasyTeam}
      />

      <div className="grid md:grid-cols-2 gap-10">
        <FantasyTeamBuilder
          allPlayers={allPlayers}
          fantasyTeam={fantasyTeam}
          onFantasyTeamChange={handleFantasyTeamChange}
        />
        <TeamStats
          stats={{
            ...stats,
            totalCredits,
          }}
          teamAnalysis={aiSuggestedTeam?.teamAnalysis}
        />
      </div>
    </div>
  );
}
