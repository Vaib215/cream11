import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import matchesSchedule from "@/data/ipl_2025_schedule.json";
import teamsData from "@/data/ipl_2025_teams.json";
import { MatchFantasySelector } from "@/components/match-fantasy-selector";
import { getPlaying11OfTeams, getCream11 } from "@/lib/gemini";
import { unstable_cache } from "next/cache";
import { Player } from "@/types/player";
import { getPlayersCredits } from "@/lib/my11circle";
import { FeedbackModal } from "@/components/feedback-modal";
import { HowToUseGuide } from "@/components/how-to-use-guide";
import { MatchWithPlayers } from "@/types/match";
import { CricketMatchList } from "@/components/cricket-match-list";
import { CricketService } from "@/lib/cricket";

export const revalidate = 60; // Revalidate page data every 60 seconds

dayjs.extend(utc);
dayjs.extend(timezone);

interface Match {
  home: string;
  away: string;
  date: string;
  start: string;
  venue: string;
  gameday_id: number;
}

async function getPlayersData(match: Match) {
  const playersData = await getPlaying11OfTeams(match);
  const playersCredits = await getPlayersCredits(match);

  // Add credits to players from API response
  Object.keys(playersData).forEach((team) => {
    playersData[team] = playersData[team].map((player) => ({
      ...player,
      credits:
        playersCredits.find((p) => p.name === player.name)?.credits || 9.0,
    }));
  });

  const finalPlayersData = playersData;
  if (
    !playersData?.[match.home]?.length ||
    !playersData?.[match.away]?.length
  ) {
    console.warn(
      `[getPlayersData] Playing XI data incomplete/missing for ${match.home} vs ${match.away}. Falling back to static team data. This might be outdated.`
    );
    const homeTeam = (teamsData as any)[match.home];
    const awayTeam = (teamsData as any)[match.away];

    // Convert team data to playing 11 format if needed
    if (homeTeam?.players?.length) {
      finalPlayersData[match.home] = homeTeam.players.map((player: any) => ({
        name: player.name,
        role: player.role || ("BATTER" as const), // Default role
        isCaptain: false,
        isViceCaptain: false,
        isImpactPlayer: false,
        credits:
          playersCredits.find((p) => p.name === player.name)?.credits || 9.0,
      }));
    } else {
      finalPlayersData[match.home] = [];
    }

    if (awayTeam?.players?.length) {
      finalPlayersData[match.away] = awayTeam.players.map((player: any) => ({
        name: player.name,
        role: player.role || ("BATTER" as const), // Default role
        isCaptain: false,
        isViceCaptain: false,
        isImpactPlayer: false,
        credits:
          playersCredits.find((p) => p.name === player.name)?.credits || 9.0,
      }));
    } else {
      finalPlayersData[match.away] = [];
    }
  }
  return finalPlayersData;
}

const getAISuggestedTeamCached = unstable_cache(
  async (match: Match) => {
    try {
      const result = await getCream11(match);
      // Preserve existing teamStats if available, otherwise use defaults
      return {
        ...result,
        teamStats: result.teamStats || {
          winProbability: 50,
          battingStrength: 60,
          bowlingStrength: 60,
          balanceRating: 55,
        },
        teamAnalysis:
          result.teamAnalysis ||
          "AI analysis will be available after team selection.",
        selectedPlayers: result.selectedPlayers || [],
        totalCredits: result.totalCredits || 0,
        captain: result.captain || "",
        viceCaptain: result.viceCaptain || "",
      };
    } catch (error) {
      console.error(
        "Error getting AI suggested team for match:",
        match.home,
        "vs",
        match.away,
        error
      );
      return {
        selectedPlayers: [],
        totalCredits: 0,
        captain: "",
        viceCaptain: "",
        teamStats: {
          winProbability: 50,
          battingStrength: 60,
          bowlingStrength: 60,
          balanceRating: 55,
        },
        teamAnalysis: "AI analysis will be available after team selection.",
      };
    }
  },
  // Use unique cache key for each match
  // @ts-nocheck
  // @ts-expect-error - match is of type Match
  (match: any) => [
    `ai-team-${match.home}-${match.away}-${match.date}-${match.start}`,
  ],
  { revalidate: 300 } // Revalidate AI suggestion cache every 5 minutes (300 seconds)
);

export default async function Home() {
  const cricketService = CricketService.getInstance();
  const upcomingMatches = await cricketService.getUpcomingMatches();

  return (
    <main className="min-h-screen p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Cricket Live</h1>

        <div className="mb-8">
          <CricketMatchList initialMatches={upcomingMatches} />
        </div>

        <div className="fixed bottom-4 right-4 flex gap-2">
          <FeedbackModal />
          <HowToUseGuide />
        </div>
      </div>
    </main>
  );
}
