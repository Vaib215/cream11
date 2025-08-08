
export const APP_NAME = "NBA Fantasy Pro";
export const SALARY_CAP = 50000;

export const COLORS = {
  primary: '#C9082A',    // NBA Red
  secondary: '#17408B',  // NBA Blue
  accent: '#FF8C00',     // NBA Orange
  background: '#1a1a1a', // Clean Dark Gray
  text: '#FFFFFF',       // Pure White
  card: '#2a2a2a',      // Solid dark card background
  cardBorder: '#404040', // Subtle border
  courtWood: '#D2691E',  // Basketball court wood
  courtLines: '#FFFFFF', // Court line white
};

export const TEAM_COMPOSITION_RULES = `
- Total Players: Exactly 8 players.
- Position Requirements:
  - Point Guards (PG): 1-3 players
  - Shooting Guards (SG): 1-3 players
  - Small Forwards (SF): 1-3 players
  - Power Forwards (PF): 1-3 players
  - Centers (C): 1-2 players
- Salary Cap: $50,000 total budget.
- Player Salaries: $3,500-$12,000.
- Team Limit: Maximum 4 players from one NBA team.
- Special Roles: Designate exactly 1 'Captain' and 1 'Star Player'.
`;

export const SCORING_SYSTEM = `
- Scoring: +1 per point, +5 bonus for 20+ points, +10 for 30+ points, +15 for 40+ points.
- Rebounds: +1.25 per rebound, +5 bonus for 10+ rebounds.
- Assists: +1.5 per assist, +5 bonus for 10+ assists.
- Steals/Blocks: +3 per steal/block.
- Turnovers: -1 per turnover.
- Field Goals: +0.5 for made FG, -0.25 for missed FG.
- Three-Pointers: +0.5 bonus for made 3PT.
- Free Throws: +0.25 for made FT, -0.25 for missed FT.
- Double-Double: +1.5 bonus, Triple-Double: +3 bonus.
- Captain Role: Gets 2x points.
- Star Player Role: Gets 1.5x points.
`;
