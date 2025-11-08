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

interface Game {
  gameDate: string;
  homeTeam: Team;
  awayTeam: Team;
}

// Read the games-minified.json file
const gamesPath = path.join(
  process.cwd(),
  "constants",
  "nba",
  "games-minified.json"
);
const outputPath = path.join(process.cwd(), "constants", "nba", "logos.json");

console.log("Reading games-minified.json...");
const rawData = fs.readFileSync(gamesPath, "utf-8");
const games: Game[] = JSON.parse(rawData);

console.log("Extracting unique team IDs...");
const teamMap = new Map<number, Team>();

games.forEach((game) => {
  if (
    game.homeTeam &&
    game.homeTeam.teamId &&
    !teamMap.has(game.homeTeam.teamId)
  ) {
    teamMap.set(game.homeTeam.teamId, game.homeTeam);
  }
  if (
    game.awayTeam &&
    game.awayTeam.teamId &&
    !teamMap.has(game.awayTeam.teamId)
  ) {
    teamMap.set(game.awayTeam.teamId, game.awayTeam);
  }
});

console.log(`Found ${teamMap.size} unique teams`);

// Generate logo URLs for each team
const logos = Array.from(teamMap.values())
  .filter((team) => team && team.teamId && team.teamName)
  .map((team) => ({
    teamId: team.teamId,
    teamName: team.teamName,
    teamCity: team.teamCity,
    teamTricode: team.teamTricode,
    teamSlug: team.teamSlug,
    logoUrl: `https://cdn.nba.com/logos/nba/${team.teamId}/primary/L/logo.svg`,
  }));

// Sort by team name for easier reading
logos.sort((a, b) => (a.teamName || "").localeCompare(b.teamName || ""));

// Write the logos data to the output file
fs.writeFileSync(outputPath, JSON.stringify(logos, null, 2), "utf-8");

console.log(`Logo URLs saved to ${outputPath}`);
console.log(`Total teams: ${logos.length}`);
