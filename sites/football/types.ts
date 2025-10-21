
export interface Club {
  name: string;
  logo: string;
}

export interface Match {
  id: number;
  team1: Club;
  team2: Club;
  date: string;
}

export interface Player {
  name: string;
  club: string;
  reasoning: string;
}

export interface Team {
  formation: string;
  strategy: string;
  team: {
    goalkeeper: Player[];
    defenders: Player[];
    midfielders: Player[];
    forwards: Player[];
  };
}

export enum ViewState {
  Fixtures = 'fixtures',
  Loading = 'loading',
  Team = 'team',
  Error = 'error',
}
