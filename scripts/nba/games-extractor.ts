import fs from "fs";
import path from "path";

interface Team {
  teamId: number;
  teamName: string;
  teamCity: string;
  teamTricode: string;
  teamSlug: string;
  wins: number;
  losses: number;
  score: number;
  seed: number;
}

interface PointsLeader {
  personId: number;
  firstName: string;
  lastName: string;
  teamId: number;
  teamCity: string;
  teamName: string;
  teamTricode: string;
  points: number;
}

interface Game {
  gameId: string;
  gameDate: string;
  gameStatusText: string;
  gameTimeUTC: string;
  gameLabel: string;
  gameSubLabel: string;
  arenaName: string;
  homeTeam: Team;
  awayTeam: Team;
  pointsLeaders: PointsLeader[];
}

interface GameDate {
  gameDate: string;
  games: Array<{
    gameId: string;
    gameStatusText: string;
    gameTimeUTC: string;
    gameLabel: string;
    gameSubLabel: string;
    arenaName: string;
    homeTeam: Team;
    awayTeam: Team;
    pointsLeaders: PointsLeader[];
  }>;
}

interface GamesData {
  leagueSchedule: {
    gameDates: GameDate[];
  };
}

// Read the original games.json file
const gamesPath = path.join(process.cwd(), "constants", "nba", "games.json");
const outputPath = path.join(
  process.cwd(),
  "constants",
  "nba",
  "games-minified.json"
);

console.log("Reading games.json...");
const rawData = fs.readFileSync(gamesPath, "utf-8");
const gamesData: GamesData = JSON.parse(rawData);

console.log("Extracting game data...");
const minifiedGames: Game[] = [];

gamesData.leagueSchedule.gameDates.forEach((gameDate) => {
  gameDate.games.forEach((game) => {
    minifiedGames.push({
      gameId: game.gameId,
      gameDate: gameDate.gameDate,
      gameStatusText: game.gameStatusText,
      gameTimeUTC: game.gameTimeUTC,
      gameLabel: game.gameLabel,
      gameSubLabel: game.gameSubLabel,
      arenaName: game.arenaName,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      pointsLeaders: game.pointsLeaders,
    });
  });
});

console.log(`Extracted ${minifiedGames.length} games`);

// Write the minified data to the output file
fs.writeFileSync(outputPath, JSON.stringify(minifiedGames, null, 2), "utf-8");

console.log(`Minified games saved to ${outputPath}`);
