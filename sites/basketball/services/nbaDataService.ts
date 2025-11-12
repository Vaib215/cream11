import type { Game } from "../types";
import rawGamesData from "../../../constants/nba/games.json";
import rawLogosData from "../../../constants/nba/logos.json";

interface TeamLogo {
  teamId: number;
  teamName: string;
  teamCity: string;
  teamTricode: string;
  logoUrl: string;
}

interface NBAGame {
  gameId: string;
  gameDateEst: string;
  gameLabel: string;
  arenaName: string;
  awayTeam: { teamId: number };
  homeTeam: { teamId: number };
}

interface GameDate {
  gameDate: string;
  games: NBAGame[];
}

interface GamesData {
  leagueSchedule: {
    gameDates: GameDate[];
  };
}

const gamesData = rawGamesData as unknown as GamesData;
const logosData = rawLogosData as unknown as TeamLogo[];

function getTeamLogo(teamId: number): string {
  const team = logosData.find((t) => t.teamId === teamId);
  return team?.logoUrl || "";
}

function getTeamFullName(teamId: number): string {
  const team = logosData.find((t) => t.teamId === teamId);
  return team ? `${team.teamCity} ${team.teamName}` : "";
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  } else {
    const diffTime = Math.abs(date.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) {
      return `In ${diffDays} Days`;
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short",
  });
}

export const fetchUpcomingGames = async (): Promise<{ games: Game[] }> => {
  try {
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const upcomingGames: Game[] = [];

    // Find games in the next 7 days
    for (const gameDate of gamesData.leagueSchedule.gameDates) {
      const date = new Date(gameDate.gameDate);

      if (date >= today && date <= sevenDaysFromNow) {
        for (const game of gameDate.games) {
          // Skip preseason games if we have regular season games
          if (game.gameLabel === "Preseason" && upcomingGames.length > 0) {
            continue;
          }

          upcomingGames.push({
            id: game.gameId,
            teamA: {
              name: getTeamFullName(game.awayTeam.teamId),
              logo: getTeamLogo(game.awayTeam.teamId),
            },
            teamB: {
              name: getTeamFullName(game.homeTeam.teamId),
              logo: getTeamLogo(game.homeTeam.teamId),
            },
            date: formatDate(game.gameDateEst),
            time: formatTime(game.gameDateEst),
            arena: game.arenaName,
          });

          // Limit to 5 games
          if (upcomingGames.length >= 5) {
            break;
          }
        }
      }

      if (upcomingGames.length >= 5) {
        break;
      }
    }

    // If no games found in next 7 days, get the next 5 games
    if (upcomingGames.length === 0) {
      for (const gameDate of gamesData.leagueSchedule.gameDates) {
        const date = new Date(gameDate.gameDate);

        if (date > today) {
          for (const game of gameDate.games) {
            upcomingGames.push({
              id: game.gameId,
              teamA: {
                name: getTeamFullName(game.awayTeam.teamId),
                logo: getTeamLogo(game.awayTeam.teamId),
              },
              teamB: {
                name: getTeamFullName(game.homeTeam.teamId),
                logo: getTeamLogo(game.homeTeam.teamId),
              },
              date: formatDate(game.gameDateEst),
              time: formatTime(game.gameDateEst),
              arena: game.arenaName,
            });

            if (upcomingGames.length >= 5) {
              break;
            }
          }
        }

        if (upcomingGames.length >= 5) {
          break;
        }
      }
    }

    return { games: upcomingGames };
  } catch (error) {
    console.error("Error fetching games from data:", error);
    throw new Error("Failed to load NBA games data");
  }
};
