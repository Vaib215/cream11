// Football data utilities
export {
  getFootballMatches,
  getMatchesByMatchweek,
  getUpcomingFootballMatches,
  getFootballMatchById,
  getFootballTeams,
  getFootballTeamById,
  getFootballSquadByTeamId,
  getAllFootballSquads,
  getFootballPlayersByTeamId,
  type FootballMatch,
  type FootballTeam,
  type FootballPlayer,
  type FootballSquad,
} from "./football-data";

// NBA data utilities
export {
  getNBAGames,
  getUpcomingNBAGames,
  getCompletedNBAGames,
  getNBAGameById,
  getNBAGamesByTeamId,
  getNBATeams,
  getNBATeamById,
  getNBARosterByTeamId,
  getAllNBARosters,
  getNBAPlayersByTeamId,
  getNBACoachesByTeamId,
  getNBAPlayerById,
  getNBAGamesByDate,
  getTodaysNBAGames,
  type NBATeam,
  type NBAPlayer,
  type NBACoach,
  type NBARoster,
  type NBAGame,
} from "./nba-data";
