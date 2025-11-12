# Fixed: Data Loading from JSON Files

## Problem

The basketball and football apps were trying to fetch games/matches data using Ollama AI, which:

1. Requires Ollama server running
2. Requires CORS configuration for browser access
3. Was unnecessary since we have all the data in JSON files

## Solution

Created dedicated data service files that read from the existing JSON files in `constants/`:

### Basketball (`sites/basketball/`)

- **Created**: `services/nbaDataService.ts`
- **Reads from**:
  - `constants/nba/games.json` - NBA schedule data
  - `constants/nba/logos.json` - Team logos and names
- **Exports**: `fetchUpcomingGames()` - Returns next 5 upcoming games

### Football (`sites/football/`)

- **Created**: `services/footballDataService.ts`
- **Reads from**:
  - `constants/football/games.json` - Premier League matches
  - `constants/football/logos.json` - Team logos and names
- **Exports**: `fetchUpcomingMatches()` - Returns next 10 upcoming matches

### Updated Services

- `sites/basketball/services/geminiService.ts` - Now only handles AI lineup generation, re-exports `fetchUpcomingGames` from nbaDataService
- `sites/football/services/geminiService.ts` - Now only handles AI team generation, re-exports `fetchUpcomingMatches` from footballDataService

## What Uses Ollama Now?

### Basketball

- ✅ `generateFantasyLineup(game)` - AI-powered lineup generation with salary cap

### Football

- ✅ `generateFplTeam(team1, team2)` - AI-powered FPL team generation with formations

### What Doesn't Use Ollama?

- ❌ Fetching games/matches - Now reads from JSON files
- ❌ Team logos - From JSON files
- ❌ Team names - From JSON files

## Benefits

1. **No Ollama Required for Browsing**: Users can browse games/matches without Ollama running
2. **Faster Loading**: Instant data loading from local JSON files
3. **No CORS Issues**: No browser-to-Ollama connection needed
4. **Real Data**: Uses actual NBA and Premier League data
5. **Ollama Only When Needed**: AI is only used for generating lineups/teams

## How It Works Now

### Basketball Flow

1. User opens app → Loads games from `constants/nba/games.json`
2. User selects a game → Clicks "Generate Lineup"
3. **Now Ollama is needed** → Generates AI-powered lineup

### Football Flow

1. User opens app → Loads matches from `constants/football/games.json`
2. User selects a match → Clicks "Generate Team"
3. **Now Ollama is needed** → Generates AI-powered FPL team

## Running the Apps

### Without Ollama (Browse Only)

```bash
cd sites/basketball  # or sites/football
bun install
bun run dev
```

- ✅ Can view all games/matches
- ✅ Can see team logos and names
- ❌ Cannot generate lineups/teams (will show error)

### With Ollama (Full Features)

```bash
# Terminal 1: Start Ollama with CORS
OLLAMA_ORIGINS=* ollama serve

# Terminal 2: Run the app
cd sites/basketball  # or sites/football
bun install
bun run dev
```

- ✅ Can view all games/matches
- ✅ Can see team logos and names
- ✅ Can generate AI-powered lineups/teams

## Testing

1. **Test without Ollama**:

   ```bash
   cd sites/basketball
   bun run dev
   ```

   - Should see games list
   - Should see team logos
   - Generating lineup should show error about Ollama

2. **Test with Ollama**:
   ```bash
   OLLAMA_ORIGINS=* ollama serve  # In another terminal
   cd sites/basketball
   bun run dev
   ```
   - Should see games list
   - Should be able to generate lineups

## Files Changed

- ✅ Created `sites/basketball/services/nbaDataService.ts`
- ✅ Created `sites/football/services/footballDataService.ts`
- ✅ Updated `sites/basketball/services/geminiService.ts`
- ✅ Updated `sites/football/services/geminiService.ts`

## No Breaking Changes

The API remains the same:

- `fetchUpcomingGames()` - Still returns `{ games: Game[] }`
- `fetchUpcomingMatches()` - Still returns `Match[]`
- `generateFantasyLineup(game)` - Still returns `Lineup`
- `generateFplTeam(team1, team2)` - Still returns `Team`

Components don't need any changes!
