import fs from "fs";
import path from "path";

const BASE_URL =
  "https://sdp-prem-prod.premier-league-prod.pulselive.com/api/v1/competitions/8/seasons/2025/matchweeks";
const TOTAL_WEEKS = 38;

interface Match {
  id: number;
  kickoff: {
    label: string;
    millis: number;
  };
  teams: Array<{
    team: {
      id: number;
      name: string;
      club: {
        name: string;
        abbr: string;
      };
    };
    score: number;
  }>;
  ground: {
    name: string;
    city: string;
  };
  status: string;
}

async function fetchMatchweek(weekNumber: number): Promise<any> {
  const url = `${BASE_URL}/${weekNumber}/matches`;
  console.log(`Fetching matchweek ${weekNumber}...`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching matchweek ${weekNumber}:`, error);
    return null;
  }
}

async function fetchAllMatches() {
  console.log("Starting to fetch Premier League matches...");
  const outputPath = path.join(
    process.cwd(),
    "constants",
    "football",
    "games.json"
  );

  // Initialize with empty array
  let allMatches: any[] = [];

  for (let week = 1; week <= TOTAL_WEEKS; week++) {
    const matchweekData = await fetchMatchweek(week);

    if (matchweekData && matchweekData.data) {
      allMatches.push({
        matchweek: week,
        matches: matchweekData.data,
      });

      // Save immediately after each fetch
      fs.writeFileSync(
        outputPath,
        JSON.stringify(allMatches, null, 2),
        "utf-8"
      );
      console.log(
        `✓ Matchweek ${week} saved (${matchweekData.data.length} matches)`
      );
    } else {
      console.log(`✗ Matchweek ${week} - no data`);
    }

    // Add a small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`\nComplete! Fetched ${allMatches.length} matchweeks total`);
  console.log(`All matches saved to ${outputPath}`);
}

fetchAllMatches().catch(console.error);
