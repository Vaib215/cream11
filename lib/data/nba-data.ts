import nbaGames from "@/constants/nba/games-minified.json";
import nbaRosters from "@/constants/nba/rosters.json";
import nbaLogos from "@/constants/nba/logos.json";

export interface NBATeam {
  teamId: number;
  teamName: string;
  teamCity: string;
  teamTricode: string;
  teamSlug: string;
  logoUrl: string;
}

export interface NBAPlayer {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  displayName: string;
  number: string;
  position: string;
  positionAbbreviation: string;
  height: string;
  weight: string;
  age: number;
  experience: string;
  country: string;
  merchUrl: string;
  teamId: number;
  stats: {
    season: {
      games: number | null;
      ppg: number | null;
      rpg: number | null;
      apg: number | null;
      spg: number | null;
    };
    career: {
      games: number | null;
      ppg: number | null;
      rpg: number | null;
      apg: number | null;
      spg: number | null;
    };
  };
  freeAgency?: any;
}

export interface NBACoach {
  id: number;
  displayName: string;
  firstName: string;
  lastName: string;
  type: string;
}

export interface NBARoster {
  teamId: number;
  roster: {
    results: {
      roster: NBAPlayer[];
      coaches: NBACoach[];
    };
  };
}

export interface NBAGame {
  gameId: string;
  gameDate: string;
  gameStatusText: string;
  gameTimeUTC: string;
  gameLabel: string;
  gameSubLabel: string;
  arenaName: string;
  homeTeam: {
    teamId: number;
    teamName: string;
    teamCity: string;
    teamTricode: string;
    teamSlug: string;
    wins: number;
    losses: number;
    score: number;
    seed: number;
  };
  awayTeam: {
    teamId: number;
    teamName: string;
    teamCity: string;
    teamTricode: string;
    teamSlug: string;
    wins: number;
    losses: number;
    score: number;
    seed: number;
  };
  pointsLeaders?: Array<{
    personId: number;
    firstName: string;
    lastName: string;
    teamId: number;
    teamCity: string;
    teamName: string;
    teamTricode: string;
    points: number;
  }>;
}

/**
 * Get all NBA games
 */
export function getNBAGames(): NBAGame[] {
  return nbaGames as NBAGame[];
}

/**
 * Get upcoming NBA games (games that haven't finished yet)
 */
export function getUpcomingNBAGames(): NBAGame[] {
  const allGames = getNBAGames();
  return allGames.filter(
    (game) => !game.gameStatusText.toLowerCase().includes("final")
  );
}

/**
 * Get completed NBA games
 */
export function getCompletedNBAGames(): NBAGame[] {
  const allGames = getNBAGames();
  return allGames.filter((game) =>
    game.gameStatusText.toLowerCase().includes("final")
  );
}

/**
 * Get a specific game by ID
 */
export function getNBAGameById(gameId: string): NBAGame | undefined {
  const allGames = getNBAGames();
  return allGames.find((game) => game.gameId === gameId);
}

/**
 * Get games by team ID
 */
export function getNBAGamesByTeamId(teamId: number): NBAGame[] {
  const allGames = getNBAGames();
  return allGames.filter(
    (game) => game.homeTeam.teamId === teamId || game.awayTeam.teamId === teamId
  );
}

/**
 * Get all NBA teams with logos
 */
export function getNBATeams(): NBATeam[] {
  return nbaLogos as NBATeam[];
}

/**
 * Get a specific team by ID
 */
export function getNBATeamById(teamId: number): NBATeam | undefined {
  const teams = getNBATeams();
  return teams.find((team) => team.teamId === teamId);
}

/**
 * Get roster for a specific team
 */
export function getNBARosterByTeamId(teamId: number): NBARoster | undefined {
  const rosters = nbaRosters as NBARoster[];
  return rosters.find((roster) => roster.teamId === teamId);
}

/**
 * Get all rosters
 */
export function getAllNBARosters(): NBARoster[] {
  return nbaRosters as NBARoster[];
}

/**
 * Get players for a specific team
 */
export function getNBAPlayersByTeamId(teamId: number): NBAPlayer[] {
  const roster = getNBARosterByTeamId(teamId);
  return roster?.roster.results.roster || [];
}

/**
 * Get coaches for a specific team
 */
export function getNBACoachesByTeamId(teamId: number): NBACoach[] {
  const roster = getNBARosterByTeamId(teamId);
  return roster?.roster.results.coaches || [];
}

/**
 * Get a specific player by ID
 */
export function getNBAPlayerById(playerId: number): NBAPlayer | undefined {
  const allRosters = getAllNBARosters();
  for (const roster of allRosters) {
    const player = roster.roster.results.roster.find((p) => p.id === playerId);
    if (player) return player;
  }
  return undefined;
}

/**
 * Get games by date
 */
export function getNBAGamesByDate(date: string): NBAGame[] {
  const allGames = getNBAGames();
  return allGames.filter((game) => game.gameDate.startsWith(date));
}

/**
 * Get today's games
 */
export function getTodaysNBAGames(): NBAGame[] {
  const today = new Date().toISOString().split("T")[0];
  return getNBAGamesByDate(today);
}
