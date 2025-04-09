import { Player, PlayerDetails } from "./player";

export interface Match {
  home: string;
  away: string;
  date: string;
  start: string;
  venue: string;
  gameday_id: number;
  id?: string;
  teams?: any;
  startTime?: string;
}

export interface FantasyTeamResult {
  selectedPlayers: Array<{
    name: string;
    role: string;
    team: string;
    credits: number;
    isCaptain: boolean;
    isViceCaptain: boolean;
  }>;
  totalCredits: number;
  captain: string;
  viceCaptain: string;
  teamAnalysis?: string;
  teamStats?: {
    winProbability: number;
    battingStrength: number;
    bowlingStrength: number;
    balanceRating: number;
  };
}

export interface MatchWithPlayers {
  id: string;
  home: string;
  away: string;
  teams: Record<
    string,
    {
      players: Player[];
      color: string;
      secondaryColor: string;
      logo?: string;
    }
  >;
  venue: string;
  startTime: string;
  date: string;
  aiSuggestedTeam?: FantasyTeamResult;
}
