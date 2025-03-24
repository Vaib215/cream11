import dayjs from "dayjs";
import matchesSchedule from "@/data/ipl_2025_schedule.json";
import teamsData from "@/data/ipl_2025_teams.json";
import { MatchFantasySelector } from "@/components/match-fantasy-selector";
import { getPlaying11OfTeams } from "@/lib/gemini";
import { unstable_cache } from "next/cache";
import { PlayerDetails } from "@/types/player";

// Define the Match type
interface Match {
  home: string;
  away: string;
  venue: string;
  start: string;
  date: string;
}

// Define the match with players type
interface MatchWithPlayers {
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
}

const getPlayersDataCached = unstable_cache(
  async (match: Match) => {
    const playersData = await getPlaying11OfTeams(match);
    if (
      !playersData?.[match.home]?.length ||
      !playersData?.[match.away]?.length
    ) {
      const homeTeam = (teamsData as any)[match.home];
      const awayTeam = (teamsData as any)[match.away];

      // Convert team data to playing 11 format if needed
      if (homeTeam?.players?.length) {
        playersData[match.home] = homeTeam.players.map((player: any) => ({
          name: player.name,
          role: player.role || ("BATTER" as const), // Default role
          isCaptain: false,
          isViceCaptain: false,
          isImpactPlayer: false,
        }));
      } else {
        playersData[match.home] = [];
      }

      if (awayTeam?.players?.length) {
        playersData[match.away] = awayTeam.players.map((player: any) => ({
          name: player.name,
          role: player.role || ("BATTER" as const), // Default role
          isCaptain: false,
          isViceCaptain: false,
          isImpactPlayer: false,
        }));
      } else {
        playersData[match.away] = [];
      }
    }

    return playersData;
  },
  ["playing-11"],
  { revalidate: 1800 } // 30 minutes
);

export const revalidate = 1800; // Revalidate this page every 30 minutes

export default async function Home() {
  const todaysMatches = matchesSchedule.matches.filter((match) =>
    dayjs(match.date).isSame(dayjs(), "day")
  );

  const matchesWithPlayers: MatchWithPlayers[] = await Promise.all(
    todaysMatches.map(async (match) => {
      const playersData = await getPlayersDataCached(match);

      return {
        id: `${match.home}-${match.away}-${match.date}`,
        teams: {
          [match.home]: {
            players: playersData[match.home].map((player) => ({
              ...player,
              imageUrl:
                (teamsData as any)[match.home]?.players.find(
                  (p: any) => p.name === player.name
                )?.imageUrl || "/images/player-placeholder.png",
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
              imageUrl:
                (teamsData as any)[match.away]?.players.find(
                  (p: any) => p.name === player.name
                )?.imageUrl || "/images/player-placeholder.png",
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
      };
    })
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-indigo-950">
      <div className="container mx-auto py-12 px-4">
        {/* <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Cream 11
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Build your ultimate fantasy cricket team from today's matches
          </p>
        </div> */}

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
