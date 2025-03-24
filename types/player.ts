export interface PlayerDetails {
  name: string;
  role: "BATTER" | "BOWLER" | "ALL_ROUNDER" | "WICKET_KEEPER";
  isCaptain: boolean;
  isViceCaptain: boolean;
  isImpactPlayer: boolean;
  imageUrl: string;
}

export interface Player extends PlayerDetails {
  team: string;
  teamColor: string;
}
