export type PlayerRole = 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper';

export interface Match {
  teamA: string;
  teamB: string;
  tournament: string;
  date: string;
  venue: string;
}

export interface Player {
  name: string;
  team: string;
  role: PlayerRole;
  photoUrl?: string;
  credits?: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
}

export interface DreamTeamResponse {
  reasoning: string;
  dreamTeam: Player[];
  allPlayers: Player[];
}

export interface GroundingSource {
  web: {
    uri: string;
    title: string;
  }
}