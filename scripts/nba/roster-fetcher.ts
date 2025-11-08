import fs from "fs";
import path from "path";

interface Team {
  teamId: number;
  teamName: string;
  teamCity: string;
  teamTricode: string;
  teamSlug: string;
  logoUrl: string;
}

interface Player {
  personId: string;
  firstName: string;
  lastName: string;
  jersey: string;
  pos: string;
  heightFeet: string;
  heightInches: string;
  weightPounds: string;
  dateOfBirthUTC: string;
  nbaDebutYear: string;
  yearsPro: string;
  collegeName: string;
  country: string;
  draft: {
    teamId: string;
    pickNum: string;
    roundNum: string;
    seasonYear: string;
  };
}

interface RosterResponse {
  league: {
    standard: {
      teamId: string;
      players: Player[];
    };
  };
}

async function fetchTeamRoster(teamId: number): Promise<any> {
  const url = `https://content-api-prod.nba.com/public/1/leagues/nba/teams/${teamId}/roster/`;

  try {
    console.log(`Fetching roster for team ${teamId}...`);
    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        `Failed to fetch roster for team ${teamId}: ${response.status}`
      );
      return null;
    }

    const data = await response.json();
    return {
      teamId,
      roster: data,
    };
  } catch (error) {
    console.error(`Error fetching roster for team ${teamId}:`, error);
    return null;
  }
}

async function fetchAllRosters() {
  // Read logos.json to get team IDs
  const logosPath = path.join(process.cwd(), "constants", "nba", "logos.json");
  const logosData = fs.readFileSync(logosPath, "utf-8");
  const teams: Team[] = JSON.parse(logosData);

  console.log(`Found ${teams.length} teams. Starting roster fetch...`);

  const outputPath = path.join(
    process.cwd(),
    "constants",
    "nba",
    "rosters.json"
  );
  const rosters = [];

  // Fetch rosters with a delay to avoid rate limiting
  for (const team of teams) {
    const roster = await fetchTeamRoster(team.teamId);
    if (roster) {
      rosters.push(roster);

      // Save immediately after each successful fetch
      fs.writeFileSync(outputPath, JSON.stringify(rosters, null, 2));
      console.log(
        `✓ Saved roster for team ${team.teamId} (${rosters.length}/${teams.length})`
      );
    }

    // Add a small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`\nSuccessfully fetched ${rosters.length} rosters`);
  console.log(`Saved to: ${outputPath}`);
}

fetchAllRosters().catch(console.error);
