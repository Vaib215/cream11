import {
  GoogleGenerativeAI,
  GoogleGenerativeAIError,
} from "@google/generative-ai";
import {
  FileState,
  GoogleAICacheManager,
  GoogleAIFileManager,
} from "@google/generative-ai/server";
const DISPLAY_NAME = "player_data";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function uploadPlayerDataCSV() {
  const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);
  const fileResult = await fileManager.uploadFile("@/data/player_data.csv", {
    displayName: DISPLAY_NAME,
    mimeType: "text/csv",
  });

  const { file } = fileResult;
  let csvFile = await fileManager.getFile(file.name);
  while (csvFile.state === FileState.PROCESSING) {
    console.log("Waiting for csv to be processed.");
    await new Promise((resolve) => setTimeout(resolve, 500));
    csvFile = await fileManager.getFile(file.name);
  }
  console.log("CSV file processed.");
  return fileResult;
}

export async function getCachedModel() {
  const fileResult = await uploadPlayerDataCSV();
  const cacheManager = new GoogleAICacheManager(process.env.GEMINI_API_KEY!);

  const cache = await cacheManager.create({
    model: "models/gemini-2.0-flash",
    displayName: DISPLAY_NAME,
    systemInstruction: `You are an expert in fantasy cricket. You are given a CSV file containing player data with following attributes:
Year: The year of the IPL season, indicating 2008 to 2024 in this case.
Player_Name: Names of the players showcasing their prowess on the cricket field.
Matches_Batted: The number of matches in which the player batted.
Not_Outs: Number of times the player remained not out while batting.
Runs_Scored: Total runs scored by the player throughout the season.
Highest_Score: Player's highest individual score in a single match.
Batting_Average: The average runs scored per dismissal.
Balls_Faced: Total number of balls faced by the player while batting.
Batting_Strike_Rate:The rate at which the player scores runs per 100 balls faced.
Centuries: Number of centuries scored by the player.
Half_Centuries: Number of half-centuries scored by the player.
Fours: Total number of boundaries (4 runs) hit by the player.
Sixes: Total number of sixes (6 runs) hit by the player.
Catches_Taken: Number of catches taken by the player in the field.
Stumpings: Number of times the player effected a stumping as a wicketkeeper.
Matches_Bowled: The number of matches in which the player bowled.
Balls_Bowled: Total number of balls bowled by the player.
Runs_Conceded: Total runs conceded by the player while bowling.
Wickets_Taken: Number of wickets taken by the player.
Best_Bowling_Match: Player's best bowling performance in a single match.
Bowling_Average: The average runs conceded per wicket taken.
Economy_Rate: The average number of runs conceded per over bowled.
Bowling_Strike_Rate: The rate at which the player takes wickets per ball bowled.
Four_Wicket_Hauls: Number of times the player took four wickets in an inning.
Five_Wicket_Hauls: Number of times the player took five wickets or more in an inning.

Rules of Fantasy Cricket:

Batting Points:
- Run: +1 pt
- Boundary Bonus: +4 pts
- Six Bonus: +6 pts
- 25 Run Bonus: +4 pts
- 50 Run Bonus: +8 pts
- 75 Run Bonus: +12 pts
- 100 Run Bonus: +16 pts
- Dismissal for a duck: -2 pts

Strike Rate Points (Min 10 Balls To Be Played):
- Above 170 runs per 100 balls: +6 pts
- Between 150.01 - 170 runs per 100 balls: +4 pts
- Between 130 - 150 runs per 100 balls: +2 pts
- Between 60 - 70 runs per 100 balls: -2 pts
- Between 50 - 59.99 runs per 100 balls: -4 pts
- Below 50 runs per 100 balls: -6 pts

Bowling Points:
- Dot Ball: +1 pt
- Wicket (Excluding Run Out): +25 pts
- Bonus (LBW/Bowled): +8 pts
- 3 Wicket Bonus: +4 pts
- 4 Wicket Bonus: +8 pts
- 5 Wicket Bonus: +12 pts
- Maiden Over: +12 pts

Economy Rate Points (Min 2 Overs To Be Bowled):
- Below 5 runs per over: +6 pts
- Between 5 - 5.99 runs per over: +4 pts
- Between 6 - 7 runs per over: +2 pts
- Between 10 - 11 runs per over: -2 pts
- Between 11.01 - 12 runs per over: -4 pts
- Above 12 runs per over: -6 pts

Fielding Points:
- Catch: +8 pts
- 3 Catch Bonus: +4 pts
- Stumping: +12 pts
- Run Out (Direct Hit): +12 pts
- Run Out (Not a Direct Hit): +6 pts

Additional Points:
- Captain Points: 2x
- Vice-Captain Points: 1.5x
- In Announced Lineups: +4 pts
- Playing Substitute: +4 pts

you can select a maximum of 8 batsmen and 8 bowlers for your fantasy cricket team. Additionally, you must include at least 1 wicketkeeper and 1 all-rounder in your team.Special Rules:
1. A player scoring a century will only get points for the century, not for 25/50/75 run bonuses.
2. Negative strike rate points only apply for strike rates of 70 or below.
3. For multiple catches, the 3 Catch Bonus is awarded only once.
4. No points for Super Over or Super Five actions.
5. Substitutes (except Concussion, X-Factor, or Impact Player) don't earn points.
6. You can select a maximum of 8 batsmen and 8 bowlers for your fantasy cricket team. Additionally, you must include at least 1 wicketkeeper and 1 all-rounder in your team.



You have to predict the best playing 11 among 2 teams based on the player data. The goal is to have the highest possible score in the game based on the rules of fantasy cricket I have provided.
      `,
    contents: [
      {
        role: "system",
        parts: [
          {
            fileData: {
              mimeType: fileResult.file.mimeType,
              fileUri: fileResult.file.uri,
            },
          },
        ],
      },
    ],
    ttlSeconds: 60 * 60 * 24 * 30 * 3, // 3 months
  });

  return genAI.getGenerativeModelFromCachedContent(cache);
}

export async function getPlaying11OfTeams(match: Match) {
  try {
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.0-flash",
      tools: [
        {
          // @ts-expect-error - google_search is not defined in the types
          google_search: {},
        },
      ],
      systemInstruction: `Your task is to return the playing 11 players for EACH team in the given match as a JSON object. Use the google_search tool to search for the players. Each player should include their role (BATTER, BOWLER, ALL_ROUNDER, or WICKET_KEEPER), and special designations like captain, vice-captain, and impact player.
      
      YOU MUST RETURN ONLY AND ONLY THE JSON OBJECT WITH PLAYER DETAILS. Here is the expected response format:
    
    \`\`\`json
    {
      "Mumbai Indians": [
        {
          "name": "Rohit Sharma", 
          "role": "BATTER", 
          "isCaptain": true, 
          "isViceCaptain": false, 
          "isImpactPlayer": false
        },
        {
          "name": "Hardik Pandya", 
          "role": "ALL_ROUNDER", 
          "isCaptain": false, 
          "isViceCaptain": true, 
          "isImpactPlayer": false
        }
      ], 
      "Chennai Super Kings": [
        {
          "name": "MS Dhoni", 
          "role": "WICKET_KEEPER", 
          "isCaptain": true, 
          "isViceCaptain": false, 
          "isImpactPlayer": false
        }
      ]
    }
    \`\`\`
    
    The player roles should be one of: BATTER, BOWLER, ALL_ROUNDER, or WICKET_KEEPER.
    Make sure to include accurate player information including their correct role, captain/vice-captain status, and impact player status.
    
    DO NOT include image URLs in your response. The image URLs will be added from our database separately.
    `,
    });
    const { response } = await model.generateContent(
      `Give me the playing 11 players for ${match.home} vs ${match.away} match on ${match.date} at ${match.venue} with complete player details including role, captain, vice-captain, and impact player status. DO NOT include image URLs in your response.`
    );
    const playersData = JSON.parse(
      response
        .text()
        .replace(/^```json\n/, "")
        .replace(/\n```$/, "")
        .replaceAll("\n", "")
    ) as Record<
      string,
      Array<{
        name: string;
        role: "BATTER" | "BOWLER" | "ALL_ROUNDER" | "WICKET_KEEPER";
        isCaptain: boolean;
        isViceCaptain: boolean;
        isImpactPlayer: boolean;
      }>
    >;
    return playersData;
  } catch (err) {
    if (err instanceof GoogleGenerativeAIError) {
      console.log(err.message);
    }

    // Return empty arrays as fallback
    return {
      [match.home]: [],
      [match.away]: [],
    };
  }
}
