
export interface Game {
  id: string;
  teamA: { name: string; logo: string; };
  teamB: { name: string; logo: string; };
  date: string;
  time: string;
  arena: string;
}

export type PlayerPosition = "PG" | "SG" | "SF" | "PF" | "C";

export type PlayerRole = "Captain" | "Star Player" | "Player";

export interface Player {
  name: string;
  team: string;
  position: PlayerPosition;
  salary: number;
  role: PlayerRole;
  analysis: string;
}

export interface Lineup {
  lineup: Player[];
  totalSalary: number;
  reasoning: string;
}
