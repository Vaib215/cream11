import dayjs from "dayjs";
import matchesSchedule from "@/data/ipl_2025_schedule.json";
import teamsData from "@/data/ipl_2025_teams.json";
import { MatchFantasySelector } from "@/components/match-fantasy-selector";
import { getPlaying11OfTeams, getCream11 } from "@/lib/gemini";
import { unstable_cache } from "next/cache";
import { PlayerDetails } from "@/types/player";
import { getPlayersCredits } from "@/lib/my11circle";

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
  };
}

const getPlayersDataCached = unstable_cache(
  async (match: Match) => {
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
  },
  ["playing-20"],
  { revalidate: 1800 } // 30 minutes
);

// Create a cache for the AI suggested team
const getAISuggestedTeamCached = unstable_cache(
  async (match: Match) => {
    try {
      const result = await getCream11(match);
      return result;
    } catch (error) {
      console.error("Error getting AI suggested team:", error);
      return {
        selectedPlayers: [],
        totalCredits: 0,
        captain: "",
        viceCaptain: "",
      };
    }
  },
  ["ai-team"],
  { revalidate: 3600 } // 1 hour
);

export default async function Home() {
  const todaysMatches = matchesSchedule.matches.filter((match) =>
    dayjs(match.date).isSame(dayjs(), "day")
  );

  const matchesWithPlayers: MatchWithPlayers[] = await Promise.all(
    todaysMatches.map(async (match) => {
      const playersData = await getPlayersDataCached(match);

      // Get AI suggested team for this match server-side
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
              imageUrl:
                `/players/${player?.name
                  ?.toLowerCase()
                  .replace(/[\s-]+/g, "_")
                  .replaceAll(".", "")}.webp` ||
                "/players/default-headshot.webp",
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
              imageUrl:
                `/players/${player.name
                  .toLowerCase()
                  .replace(/[\s-]+/g, "_")
                  .replaceAll(".", "")}.webp` ||
                "/players/default-headshot.webp",
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
        aiSuggestedTeam, // Pass pre-generated AI team
      };
    })
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-indigo-950">
      <div className="container mx-auto py-12 px-4">
        <div className="grid gap-10">
          {matchesWithPlayers.map((match) => (
            <div
              key={match.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl"
            >
              <MatchFantasySelector match={match} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
