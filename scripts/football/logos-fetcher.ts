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

async function fetchLogo(teamId: string): Promise<string | null> {
  const url = `https://resources.premierleague.com/premierleague25/badges-alt/${teamId}.svg`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return url;
  } catch (error) {
    console.error(`Error fetching logo for team ${teamId}:`, error);
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

  // Extract unique teams with their details
  const teamsMap = new Map<
    string,
    { id: string; name: string; shortName: string }
  >();

  gamesData.forEach((matchweek) => {
    matchweek.matches.forEach((match) => {
      if (!teamsMap.has(match.homeTeam.id)) {
        teamsMap.set(match.homeTeam.id, {
          id: match.homeTeam.id,
          name: match.homeTeam.name,
          shortName: match.homeTeam.shortName,
        });
      }
      if (!teamsMap.has(match.awayTeam.id)) {
        teamsMap.set(match.awayTeam.id, {
          id: match.awayTeam.id,
          name: match.awayTeam.name,
          shortName: match.awayTeam.shortName,
        });
      }
    });
  });

  console.log(`Found ${teamsMap.size} unique teams`);

  // Fetch logos for each team
  const logos: Record<
    string,
    { id: string; name: string; shortName: string; logoUrl: string }
  > = {};

  for (const [teamId, teamInfo] of teamsMap) {
    console.log(`Fetching logo for ${teamInfo.name} (ID: ${teamId})...`);
    const logoUrl = await fetchLogo(teamId);

    if (logoUrl) {
      logos[teamId] = {
        id: teamId,
        name: teamInfo.name,
        shortName: teamInfo.shortName,
        logoUrl: logoUrl,
      };
      console.log(`✓ Successfully fetched logo for ${teamInfo.name}`);
    } else {
      console.log(`✗ Failed to fetch logo for ${teamInfo.name}`);
    }

    // Add a small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // Save to logos.json
  const logosPath = path.join(
    process.cwd(),
    "constants",
    "football",
    "logos.json"
  );
  fs.writeFileSync(logosPath, JSON.stringify(logos, null, 2));

  console.log(
    `\nSuccessfully saved logos for ${
      Object.keys(logos).length
    } teams to ${logosPath}`
  );
}

main();
