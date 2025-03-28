export interface PlayerDetails {
  name: string;
  role: "BATTER" | "BOWLER" | "ALL_ROUNDER" | "WICKET_KEEPER";
  isCaptain: boolean;
  isViceCaptain: boolean;
  isImpactPlayer: boolean;
  imageUrl: string;
  credits: number;
}

export interface SelectedPlayer extends PlayerDetails {
  credits: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
  isImpactPlayer: boolean;
}

export interface Player extends PlayerDetails {
  team: string;
  teamColor: string;
  credits: number;
}
