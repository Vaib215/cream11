import type { Match } from "../types";
import gamesData from "../../../constants/football/games.json";
import logosData from "../../../constants/football/logos.json";

interface TeamLogo {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string;
}

const logos = logosData as Record<string, TeamLogo>;

function getTeamLogo(teamId: string): string {
  return logos[teamId]?.logoUrl || "";
}

function getTeamName(teamId: string): string {
  return logos[teamId]?.name || "";
}

function formatMatchDate(kickoff: string): string {
  const date = new Date(kickoff);
  return date
    .toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
    .toUpperCase()
    .replace(",", " -");
}

export const fetchUpcomingMatches = async (): Promise<Match[]> => {
  try {
    const today = new Date();
    const upcomingMatches: Match[] = [];

    // Find upcoming matches (not yet finished)
    for (const matchweek of gamesData) {
      for (const match of matchweek.matches) {
        const kickoffDate = new Date(match.kickoff);

        // Include matches that haven't finished or are upcoming
        if (kickoffDate >= today || match.period === "PreMatch") {
          upcomingMatches.push({
            id: parseInt(match.matchId),
            team1: {
              name: getTeamName(match.homeTeam.id) || match.homeTeam.name,
              logo: getTeamLogo(match.homeTeam.id),
            },
            team2: {
              name: getTeamName(match.awayTeam.id) || match.awayTeam.name,
              logo: getTeamLogo(match.awayTeam.id),
            },
            date: formatMatchDate(match.kickoff),
          });

          // Limit to 10 matches
          if (upcomingMatches.length >= 10) {
            break;
          }
        }
      }

      if (upcomingMatches.length >= 10) {
        break;
      }
    }

    // If no upcoming matches found, get the first 10 matches from the data
    if (upcomingMatches.length === 0) {
      let count = 0;
      for (const matchweek of gamesData) {
        for (const match of matchweek.matches) {
          upcomingMatches.push({
            id: parseInt(match.matchId),
            team1: {
              name: getTeamName(match.homeTeam.id) || match.homeTeam.name,
              logo: getTeamLogo(match.homeTeam.id),
            },
            team2: {
              name: getTeamName(match.awayTeam.id) || match.awayTeam.name,
              logo: getTeamLogo(match.awayTeam.id),
            },
            date: formatMatchDate(match.kickoff),
          });

          count++;
          if (count >= 10) {
            break;
          }
        }

        if (count >= 10) {
          break;
        }
      }
    }

    return upcomingMatches;
  } catch (error) {
    console.error("Error fetching matches from data:", error);
    throw new Error("Failed to load football matches data");
  }
};
