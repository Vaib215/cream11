"use server";

import { getCustomTeamAnalysis } from "@/lib/gemini";
import { Player } from "@/types/player";

export async function analyzeTeam(team: Player[], aiSuggestedTeam: Player[]) {
  try {
    const selectedPlayers = team.map((player) => ({
      name: player.name,
      role: player.role,
      team: player.team,
      credits: player.credits,
      isCaptain: player.isCaptain,
      isViceCaptain: player.isViceCaptain,
      isImpactPlayer: player.isImpactPlayer,
      imageUrl: player.imageUrl,
    }));

    const result = await getCustomTeamAnalysis(
      {
        home: team[0]?.team || "Team1",
        away: team.find((p) => p.team !== team[0]?.team)?.team || "Team2",
        date: new Date().toISOString().split("T")[0],
        start: new Date().toTimeString().split(" ")[0],
        venue: "Default Venue",
        gameday_id: 1,
      },
      selectedPlayers,
      aiSuggestedTeam
    );

    return result;
  } catch (error) {
    console.error("Failed to analyze team:", error);
    throw error;
  }
}
