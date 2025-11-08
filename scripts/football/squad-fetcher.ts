import fs from "fs";
import path from "path";

interface Team {
  id: string;
  name: string;
  shortName: string;
}

interface Match {
  homeTeam: Team;
  awayTeam: Team;
}

interface Matchweek {
  matchweek: number;
  matches: Match[];
}

async function fetchSquad(teamId: string) {
  const url = `https://sdp-prem-prod.premier-league-prod.pulselive.com/api/v2/competitions/8/seasons/2025/teams/${teamId}/squad`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching squad for team ${teamId}:`, error);
    return null;
  }
}

async function main() {
  // Read games.json
  const gamesPath = path.join(
    process.cwd(),
    "constants",
    "football",
    "games.json"
  );
  const gamesData: Matchweek[] = JSON.parse(
    fs.readFileSync(gamesPath, "utf-8")
  );

  // Extract unique team IDs
  const teamIds = new Set<string>();
  gamesData.forEach((matchweek) => {
    matchweek.matches.forEach((match) => {
      teamIds.add(match.homeTeam.id);
      teamIds.add(match.awayTeam.id);
    });
  });

  console.log(`Found ${teamIds.size} unique teams`);

  // Fetch squads for each team
  const squads: Record<string, any> = {};

  for (const teamId of Array.from(teamIds)) {
    console.log(`Fetching squad for team ${teamId}...`);
    const squad = await fetchSquad(teamId);

    if (squad) {
      squads[teamId] = squad;
      console.log(`✓ Successfully fetched squad for team ${teamId}`);
    } else {
      console.log(`✗ Failed to fetch squad for team ${teamId}`);
    }

    // Add a small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Save to squads.json
  const squadsPath = path.join(
    process.cwd(),
    "constants",
    "football",
    "squads.json"
  );
  fs.writeFileSync(squadsPath, JSON.stringify(squads, null, 2));

  console.log(
    `\nSuccessfully saved squads for ${
      Object.keys(squads).length
    } teams to ${squadsPath}`
  );
}

main();
