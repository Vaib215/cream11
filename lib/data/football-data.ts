import footballGames from "@/constants/football/games.json";
import footballSquads from "@/constants/football/squads.json";
import footballLogos from "@/constants/football/logos.json";

export interface FootballMatch {
  matchweek: number;
  matches: Array<{
    kickoffTimezone: string;
    period: string;
    kickoff: string;
    awayTeam: {
      score?: number;
      name: string;
      id: string;
      halfTimeScore?: number;
      shortName: string;
      redCards?: number;
    };
    homeTeam: {
      score?: number;
      name: string;
      id: string;
      halfTimeScore?: number;
      shortName: string;
      redCards?: number;
    };
    competition: string;
    ground: string;
    clock?: string;
    resultType?: string;
    matchId: string;
    attendance?: number;
  }>;
}

export interface FootballTeam {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string;
}

export interface FootballPlayer {
  country: {
    isoCode: string;
    country: string;
    demonym: string;
  };
  loan: number;
  countryOfBirth: string;
  name: {
    last: string;
    display: string;
    first: string;
  };
  shirtNum: number;
  weight: number;
  dates: {
    joinedClub: string;
    birth: string;
  };
  id: string;
  position: string;
  preferredFoot: string;
  height: number;
}

export interface FootballSquad {
  players: FootballPlayer[];
  id: {
    competitionId: string;
    seasonId: string;
  };
  team: {
    name: string;
    id: string;
    shortName: string;
  };
}

/**
 * Get all football matches grouped by matchweek
 */
export function getFootballMatches(): FootballMatch[] {
  return footballGames as FootballMatch[];
}

/**
 * Get matches for a specific matchweek
 */
export function getMatchesByMatchweek(matchweek: number) {
  const allMatches = getFootballMatches();
  return allMatches.find((m) => m.matchweek === matchweek);
}

/**
 * Get upcoming matches (matches that haven't been played yet)
 */
export function getUpcomingFootballMatches() {
  const allMatches = getFootballMatches();
  return allMatches
    .flatMap((week) => week.matches)
    .filter(
      (match) =>
        match.period === "PreMatch" ||
        match.period === "FirstHalf" ||
        match.period === "SecondHalf"
    );
}

/**
 * Get a specific match by ID
 */
export function getFootballMatchById(matchId: string) {
  const allMatches = getFootballMatches();
  for (const week of allMatches) {
    const match = week.matches.find((m) => m.matchId === matchId);
    if (match) return match;
  }
  return null;
}

/**
 * Get all football teams with logos
 */
export function getFootballTeams(): FootballTeam[] {
  const logosData = footballLogos as Record<string, FootballTeam>;
  return Object.values(logosData);
}

/**
 * Get a specific team by ID
 */
export function getFootballTeamById(teamId: string): FootballTeam | undefined {
  const logosData = footballLogos as Record<string, FootballTeam>;
  return logosData[teamId];
}

/**
 * Get squad for a specific team
 */
export function getFootballSquadByTeamId(
  teamId: string
): FootballSquad | undefined {
  const squadsData = footballSquads as Record<string, FootballSquad>;
  return squadsData[teamId];
}

/**
 * Get all squads
 */
export function getAllFootballSquads(): Record<string, FootballSquad> {
  return footballSquads as Record<string, FootballSquad>;
}

/**
 * Get players for a specific team
 */
export function getFootballPlayersByTeamId(teamId: string): FootballPlayer[] {
  const squad = getFootballSquadByTeamId(teamId);
  return squad?.players || [];
}
