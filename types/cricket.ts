import { Match } from './match';
import { Player } from './player';

export type MatchFormat = 'test' | 'odi' | 't20' | 't20i' | 'first_class';

export interface TeamInfo {
  name: string;
  shortname: string;
  img: string;
}

export interface Score {
  r: number; // runs
  w: number; // wickets
  o: number; // overs
  inning: string;
}

export interface CricAPIMatch {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo: TeamInfo[];
  score?: Score[];
  series_id: string;
  fantasyEnabled: boolean;
  bbbEnabled: boolean;
  hasSquad: boolean;
  matchStarted: boolean;
  matchEnded: boolean;
}

export interface CricAPIResponse {
  apikey: string;
  data: CricAPIMatch[];
  status: string;
  info: {
    hitsToday: number;
    hitsUsed: number;
    hitsLimit: number;
    credits: number;
    server: number;
    offsetRows: number;
    totalRows: number;
    queryTime: number;
    s: number;
    cache: number;
  };
}

export interface InternationalMatch extends Match {
  format: MatchFormat;
  series: string;
  ground: string;
  matchNumber?: string;
  toss?: {
    winner: string;
    decision: 'BAT' | 'FIELD';
  };
  matchStatus: 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'ABANDONED';
  teamInfo: TeamInfo[];
  score?: Score[];
}

export interface PlayerStats {
  format: MatchFormat;
  matches: number;
  runs: number;
  highestScore: string;
  average: number;
  strikeRate: number;
  hundreds: number;
  fifties: number;
  wickets: number;
  bowlingAverage: number;
  economy: number;
  bestBowling: string;
  catches: number;
  stumpings: number;
  ranking?: {
    batting?: number;
    bowling?: number;
    allRounder?: number;
  };
}

export interface InternationalPlayer extends Player {
  dateOfBirth: string;
  nationality: string;
  stats: Record<MatchFormat, PlayerStats>;
  recentForm: {
    lastFiveMatches: {
      format: MatchFormat;
      runs?: number;
      wickets?: number;
      against: string;
      date: string;
    }[];
  };
}

export interface Team {
  name: string;
  shortName: string;
  ranking: Record<MatchFormat, number>;
  recentForm: {
    lastFiveMatches: {
      format: MatchFormat;
      result: 'WIN' | 'LOSS' | 'DRAW' | 'NR';
      against: string;
      date: string;
    }[];
  };
  squad: InternationalPlayer[];
  homeVenue: string[];
}

export interface Series {
  name: string;
  format: MatchFormat;
  startDate: string;
  endDate: string;
  teams: string[];
  matches: InternationalMatch[];
  points?: {
    [teamName: string]: number;
  };
}

export interface SportDevsMatch {
  id: number;
  name: string;
  status: string;
  duration: number;
  league_id: number;
  season_id: number;
  start_time: string;
  league_name: string;
  season_name: string;
  away_team_id: number;
  home_team_id: number;
  status_reason: string;
  tournament_id: number;
  away_team_name: string;
  home_team_name: string;
  away_team_score?: number;
  home_team_score?: number;
  tournament_name: string;
  league_hash_image: string;
  away_team_hash_image: string;
  home_team_hash_image: string;
  tournament_importance: number;
}

export interface SportDevsDayMatches {
  date: string;
  matches: SportDevsMatch[];
}

export interface SportDevsResponse extends Array<SportDevsDayMatches> { } 