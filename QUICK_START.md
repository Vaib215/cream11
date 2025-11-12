# Quick Start Guide - Local Sports Data

## TL;DR

All sports data is now available locally. Import from `@/lib/data` and use the utility functions.

## Quick Examples

### Football (Premier League)

```typescript
import { getFootballMatches, getFootballTeamById } from "@/lib/data";

// Get all matches
const matches = getFootballMatches();

// Get Liverpool's info and logo
const liverpool = getFootballTeamById("14");
console.log(liverpool.logoUrl); // https://resources.premierleague.com/...
```

### NBA (Basketball)

```typescript
import { getNBAGames, getNBATeamById } from "@/lib/data";

// Get all games
const games = getNBAGames();

// Get 76ers info and logo
const sixers = getNBATeamById(1610612755);
console.log(sixers.logoUrl); // https://cdn.nba.com/logos/...
```

## Common Use Cases

### Display Match List

```typescript
import { getFootballMatches, getFootballTeamById } from "@/lib/data";

export default function MatchesPage() {
  const allMatches = getFootballMatches();

  return (
    <div>
      {allMatches.map((week) => (
        <div key={week.matchweek}>
          <h2>Matchweek {week.matchweek}</h2>
          {week.matches.map((match) => {
            const homeTeam = getFootballTeamById(match.homeTeam.id);
            const awayTeam = getFootballTeamById(match.awayTeam.id);

            return (
              <div key={match.matchId}>
                <img src={homeTeam?.logoUrl} alt={homeTeam?.name} />
                {match.homeTeam.shortName} vs {match.awayTeam.shortName}
                <img src={awayTeam?.logoUrl} alt={awayTeam?.name} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
```

### Display Team Squad

```typescript
import { getFootballPlayersByTeamId, getFootballTeamById } from "@/lib/data";

export default function TeamPage({ teamId }: { teamId: string }) {
  const team = getFootballTeamById(teamId);
  const players = getFootballPlayersByTeamId(teamId);

  return (
    <div>
      <h1>{team?.name}</h1>
      <img src={team?.logoUrl} alt={team?.name} />

      <h2>Squad</h2>
      {players.map((player) => (
        <div key={player.id}>
          <p>
            {player.name.display} - #{player.shirtNum}
          </p>
          <p>{player.position}</p>
        </div>
      ))}
    </div>
  );
}
```

### Display NBA Game with Stats

```typescript
import { getNBAGameById, getNBATeamById } from "@/lib/data";

export default function GamePage({ gameId }: { gameId: string }) {
  const game = getNBAGameById(gameId);
  const homeTeam = getNBATeamById(game.homeTeam.teamId);
  const awayTeam = getNBATeamById(game.awayTeam.teamId);

  return (
    <div>
      <div>
        <img src={awayTeam?.logoUrl} alt={awayTeam?.teamName} />
        {game.awayTeam.teamTricode} - {game.awayTeam.score}
      </div>
      <div>vs</div>
      <div>
        <img src={homeTeam?.logoUrl} alt={homeTeam?.teamName} />
        {game.homeTeam.teamTricode} - {game.homeTeam.score}
      </div>
      <p>{game.gameStatusText}</p>
      <p>{game.arenaName}</p>
    </div>
  );
}
```

## All Available Functions

### Football

- `getFootballMatches()` - All matches
- `getUpcomingFootballMatches()` - Upcoming only
- `getFootballTeamById(id)` - Team with logo
- `getFootballPlayersByTeamId(id)` - Team players

### NBA

- `getNBAGames()` - All games
- `getUpcomingNBAGames()` - Upcoming only
- `getNBATeamById(id)` - Team with logo
- `getNBAPlayersByTeamId(id)` - Team players

## See Full Documentation

- **Detailed Guide**: `lib/data/README.md`
- **Example Pages**:
  - `app/football/matches/page.tsx`
  - `app/basketball/games/page.tsx`
- **Migration Info**: `MIGRATION_SUMMARY.md`

## Data Location

All data files are in `constants/`:

- `constants/football/` - Premier League data
- `constants/nba/` - NBA data

To update data, just replace these JSON files!
