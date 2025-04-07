import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import matchesSchedule from "@/data/ipl_2025_schedule.json";
import teamsData from "@/data/ipl_2025_teams.json";
import { MatchFantasySelector } from "@/components/match-fantasy-selector";
import { getPlaying11OfTeams, getCream11 } from "@/lib/gemini";
import { unstable_cache } from "next/cache";
import { PlayerDetails } from "@/types/player";
import { getPlayersCredits } from "@/lib/my11circle";
import { FeedbackModal } from "@/components/feedback-modal";
import { HowToUseGuide } from "@/components/how-to-use-guide";

const revalidate = 3600 * 3; // 3 hours

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

interface MatchWithPlayers {
  id: string;
  home: string;
  away: string;
  teams: Record<
    string,
    {
      players: (PlayerDetails & { imageUrl: string })[];
      color: string;
      secondaryColor: string;
      logo?: string;
    }
  >;
  venue: string;
  startTime: string;
  date: string;
  aiSuggestedTeam?: {
    selectedPlayers: any[];
    totalCredits: number;
    captain: string;
    viceCaptain: string;
    teamStats: {
      winProbability: number;
      battingStrength: number;
      bowlingStrength: number;
      balanceRating: number;
    };
    teamAnalysis: string;
  };
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
  { revalidate: 3600 } // 1 hour
);

export default async function Home() {
  const todaysMatches = matchesSchedule.matches.filter((match) => {
    const matchDate = dayjs.tz(
      `${match.date} ${match.start}`,
      "DD-MMM-YY h:mm A",
      "Asia/Kolkata"
    );
    const nowInKolkata = dayjs().tz("Asia/Kolkata");
    return matchDate.isSame(nowInKolkata, "day");
  });

  const matchesWithPlayers: MatchWithPlayers[] = await Promise.all(
    todaysMatches.map(async (match) => {
      const playersData = await getPlayersData(match);
      const aiSuggestedTeam = await getAISuggestedTeamCached(match);
      return {
        id: `${match.home}-${match.away}-${match.date}`,
        home: match.home,
        away: match.away,
        teams: {
          [match.home]: {
            players: playersData[match.home].map((player) => ({
              ...player,
              credits: player.credits || 9.0,
              imageUrl: `/players/${player?.name
                ?.toLowerCase()
                ?.replace(/[\s-]+/g, "_")
                ?.replaceAll(".", "")}.webp`,
              isImpactPlayer: player.isImpactPlayer || false,
              isCaptain: player.isCaptain || false,
              isViceCaptain: player.isViceCaptain || false,
              role: player.role || "BATTER",
              team: match.home,
              teamColor:
                (teamsData as any)[match.home]?.colors?.color || "#333333",
            })),
            color: (teamsData as any)[match.home]?.colors?.color || "#333333",
            secondaryColor:
              (teamsData as any)[match.home]?.colors?.secondaryColor ||
              "#CCCCCC",
            logo: (teamsData as any)[match.home]?.logo || "",
          },
          [match.away]: {
            players: playersData[match.away].map((player) => ({
              ...player,
              credits: player.credits || 9.0,
              imageUrl: `/players/${player.name
                ?.toLowerCase()
                ?.replace(/[\s-]+/g, "_")
                ?.replaceAll(".", "")}.webp`,
              isImpactPlayer: player.isImpactPlayer || false,
              isCaptain: player.isCaptain || false,
              isViceCaptain: player.isViceCaptain || false,
              role: player.role || "BATTER",
              team: match.away,
              teamColor:
                (teamsData as any)[match.away]?.colors?.color || "#333333",
            })),
            color: (teamsData as any)[match.away]?.colors?.color || "#333333",
            secondaryColor:
              (teamsData as any)[match.away]?.colors?.secondaryColor ||
              "#CCCCCC",
            logo: (teamsData as any)[match.away]?.logo || "",
          },
        },
        venue: match.venue,
        startTime: match.start,
        date: match.date,
        aiSuggestedTeam,
      };
    })
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-indigo-950">
      <header className="sticky top-0 z-50 bg-gradient-to-r from-indigo-700 to-purple-700 shadow-md">
        <div className="container mx-auto px-4 py-3 md:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center">
              <span className="text-orange-400">Cream</span>
              <span className="text-white">11</span>
            </h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <p className="text-xs sm:text-sm md:text-base text-indigo-200">
                AI-Powered Fantasy Cricket Team Builder
              </p>
              <div className="flex items-center gap-2 mt-1 sm:mt-0">
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-indigo-600/30 text-indigo-200">
                  IPL 2025
                </span>
                <HowToUseGuide />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="grid gap-8">
          {matchesWithPlayers.map((match) => (
            <div
              key={match.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              <MatchFantasySelector match={match} />
            </div>
          ))}
          {matchesWithPlayers.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-100 dark:border-gray-700">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-indigo-600 dark:text-indigo-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                No matches scheduled for today
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Check back later for upcoming matches. You can still view
                previous match results in the history section.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 relative z-40 dark:bg-gray-900 text-white mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-300">
              © {new Date().getFullYear()} Cream11 - Fantasy Cricket Assistant
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-xs text-gray-400">
                Not affiliated with any official cricket league or organization
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Feedback Component */}
      <FeedbackModal />
    </main>
  );
}
