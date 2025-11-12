# Sports Data Utilities

This directory contains utility functions to access local sports data (Football/Premier League and NBA) without making external API calls.

## Overview

All data is stored locally in the `constants/` directory:

- **Football**: `constants/football/` (games.json, squads.json, logos.json)
- **NBA**: `constants/nba/` (games-minified.json, rosters.json, logos.json)

## Usage

### Football Data

```typescript
import {
  getFootballMatches,
  getMatchesByMatchweek,
  getUpcomingFootballMatches,
  getFootballMatchById,
  getFootballTeams,
  getFootballTeamById,
  getFootballSquadByTeamId,
  getFootballPlayersByTeamId,
} from "@/lib/data";

// Get all matches grouped by matchweek
const allMatches = getFootballMatches();

// Get matches for a specific matchweek
const matchweek1 = getMatchesByMatchweek(1);

// Get upcoming matches (not yet played)
const upcomingMatches = getUpcomingFootballMatches();

// Get a specific match by ID
const match = getFootballMatchById("2561895");

// Get all teams with logos
const teams = getFootballTeams();

// Get a specific team
const team = getFootballTeamById("14"); // Liverpool

// Get squad for a team
const squad = getFootballSquadByTeamId("14");

// Get players for a team
const players = getFootballPlayersByTeamId("14");
```

### NBA Data

```typescript
import {
  getNBAGames,
  getUpcomingNBAGames,
  getCompletedNBAGames,
  getNBAGameById,
  getNBAGamesByTeamId,
  getNBATeams,
  getNBATeamById,
  getNBARosterByTeamId,
  getNBAPlayersByTeamId,
  getNBACoachesByTeamId,
  getNBAPlayerById,
  getTodaysNBAGames,
} from "@/lib/data";

// Get all NBA games
const allGames = getNBAGames();

// Get upcoming games
const upcomingGames = getUpcomingNBAGames();

// Get completed games
const completedGames = getCompletedNBAGames();

// Get a specific game
const game = getNBAGameById("0022500001");

// Get games for a specific team
const teamGames = getNBAGamesByTeamId(1610612755); // 76ers

// Get all teams with logos
const teams = getNBATeams();

// Get a specific team
const team = getNBATeamById(1610612755); // 76ers

// Get roster for a team
const roster = getNBARosterByTeamId(1610612755);

// Get players for a team
const players = getNBAPlayersByTeamId(1610612755);

// Get coaches for a team
const coaches = getNBACoachesByTeamId(1610612755);

// Get a specific player
const player = getNBAPlayerById(1630178); // Tyrese Maxey

// Get today's games
const todaysGames = getTodaysNBAGames();
```

## Data Types

### Football Types

```typescript
interface FootballMatch {
  matchweek: number;
  matches: Array<{
    matchId: string;
    homeTeam: { id: string; name: string; shortName: string; score?: number };
    awayTeam: { id: string; name: string; shortName: string; score?: number };
    kickoff: string;
    ground: string;
    period: string;
    // ... more fields
  }>;
}

interface FootballTeam {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string;
}

interface FootballPlayer {
  id: string;
  name: { first: string; last: string; display: string };
  position: string;
  shirtNum: number;
  height: number;
  weight: number;
  // ... more fields
}
```

### NBA Types

```typescript
interface NBAGame {
  gameId: string;
  gameDate: string;
  gameStatusText: string;
  homeTeam: { teamId: number; teamName: string; score: number; wins: number; losses: number };
  awayTeam: { teamId: number; teamName: string; score: number; wins: number; losses: number };
  arenaName: string;
  // ... more fields
}

interface NBATeam {
  teamId: number;
  teamName: string;
  teamCity: string;
  teamTricode: string;
  logoUrl: string;
}

interface NBAPlayer {
  id: number;
  name: string;
  position: string;
  number: string;
  height: string;
  weight: string;
  stats: { season: {...}, career: {...} };
  // ... more fields
}
```

## Examples

See the example pages:

- Football: `app/football/matches/page.tsx`
- NBA: `app/basketball/games/page.tsx`

## Benefits

1. **No API calls**: All data is local, no network requests needed
2. **Fast**: Instant data access without latency
3. **Type-safe**: Full TypeScript support with proper types
4. **Offline-ready**: Works without internet connection
5. **No rate limits**: Access data as much as needed

## Updating Data

To update the data, replace the JSON files in the `constants/` directory:

- `constants/football/games.json`
- `constants/football/squads.json`
- `constants/football/logos.json`
- `constants/nba/games-minified.json`
- `constants/nba/rosters.json`
- `constants/nba/logos.json`
