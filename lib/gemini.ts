import {
  GoogleGenerativeAI,
  GoogleGenerativeAIError,
} from "@google/generative-ai";
import { getPlayersCredits } from "./my11circle";
import { Match } from "@/types/match";
import { Player, PlayerDetails, SelectedPlayer } from "@/types/player";
import { fantasyCricketRules } from "@/constants/rules";
import historicalData from "@/data/ipl_2024_player_data.json";
import { unstable_cache } from "next/cache";

const API_KEYS = process.env.GEMINI_API_KEYS?.split(",") || [
  process.env.GEMINI_API_KEY!,
];
let currentKeyIndex = 0;
let rateLimitResetTime = 0;

function isRateLimited(error: unknown) {
  return (
    error instanceof GoogleGenerativeAIError &&
    (error.message.includes("quota") || error.message.includes("rate limit"))
  );
}

async function withKeyRotation<T>(
  fn: (genAI: GoogleGenerativeAI) => Promise<T>
): Promise<T> {
  const attempts = new Set<number>();

  while (attempts.size < API_KEYS.length) {
    const genAI = new GoogleGenerativeAI(API_KEYS[currentKeyIndex]);

    try {
      // Wait if we hit rate limit recently
      if (Date.now() < rateLimitResetTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, rateLimitResetTime - Date.now())
        );
      }

      return await fn(genAI);
    } catch (error) {
      if (isRateLimited(error)) {
        console.log(`Rate limited on key ${currentKeyIndex}, rotating...`);
        rateLimitResetTime = Date.now() + 60000; // Block for 1 minute
        attempts.add(currentKeyIndex);
        currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
      } else {
        throw error;
      }
    }
  }

  throw new Error("All API keys exhausted");
}

interface FantasyTeamResult {
  selectedPlayers: Array<{
    name: string;
    role: string;
    team: string;
    credits: number;
    isCaptain: boolean;
    isViceCaptain: boolean;
  }>;
  totalCredits: number;
  captain: string;
  viceCaptain: string;
  teamAnalysis?: string;
  teamStats: {
    winProbability: number;
    battingStrength: number;
    bowlingStrength: number;
    balanceRating: number;
  };
}

export const getCream11 = unstable_cache(
  async (match: Match) => {
    return withKeyRotation(async (genAI) => {
      try {
        // Get all players from both teams with their roles and credits
        const allPlayers = await getPlaying11OfTeams(match);
        const playersCredits = await getPlayersCredits(match);

        // Set default credits if not available
        const playersWithCredits = Object.entries(
          allPlayers as Record<string, PlayerDetails[]>
        ).flatMap(([team, players]) =>
          players.map((player: PlayerDetails) => ({
            ...player,
            team,
            history: historicalData[player.name as keyof typeof historicalData],
            credits:
              playersCredits.find((p) => p.name === player.name)?.credits || 8,
          }))
        );

        // Create list of valid player names from both teams
        const validPlayerNames = playersWithCredits.map((p) => p.name);

        const model = genAI.getGenerativeModel({
          model: "models/gemini-2.0-flash",
          // Add Google Search Tool for grounding
          // @ts-expect-error - googleSearch is not defined in the base types but is a valid tool
          tools: [{ googleSearch: {} }],
          systemInstruction: `You are an expert fantasy cricket analyst. Your task is to create the optimal fantasy team using ONLY players from ${match.home} and ${match.away}.
          
          STRICT RULES:
          1. Only select players from the provided list of ${match.home} and ${match.away} players.
          2. Never suggest players from other teams.
          3. Validate all player names against the provided list.
          4. Reject any players not in the provided roster.
          5. Use the Google Search tool to find the most recent player statistics for the current season to supplement the historical data.
          
          **TOSS FACTOR:** Use Google Search to determine typical pitch behavior and toss impact at ${match.venue}. Factor this into your player selection and analysis (e.g., if dew makes batting second easier, favor players accordingly). Mention the assumed toss impact in your analysis.
          
          **CRITICAL TEAM COMPOSITION RULES:**
          The total sum of credits must be under 100.
          Make sure to include at least:
          - 1 wicketkeeper
          - 1 all-rounder
          - 3-5 batters
          - 3-5 bowlers
          **- Maximum of 7 players can be selected from a single team (${match.home} or ${match.away}).**
          
          Also suggest a captain (2x points) and vice-captain (1.5x points) from the selected players.
          IMPORTANT: Choose the captain and vice-captain based on their potential to score the most fantasy points (considering both history and recent form), NOT based on their real-life leadership roles. Captain should be your highest potential point-scoring player, and vice-captain should be your second-highest scoring potential player.
          
          Base your selections on a combination of historical data and **current season performance (found via search)**. Use specific statistics (historical and recent) to justify each selection.
          
          Provide a detailed team analysis that evaluates:
          1. Each selected player individually with key historical and **recent** statistics (batting averages, strike rates, economy rates, wickets, etc.).
          2. Recent form analysis using data obtained from search.
          3. Detailed statistical justification for captain and vice-captain choices, referencing both historical and recent data.
          4. Overall team balance and strategy with quantitative assessment.
          
          Also provide team stats with the following values:
          - winProbability: a number between 0-100 representing the team's chance of winning based on selected players' form and history.
          - battingStrength: a number between 0-100 representing the team's batting quality.
          - bowlingStrength: a number between 0-100 representing the team's bowling quality.
          - balanceRating: a number between 0-100 representing how well-balanced the team is.
          **Ensure these stats are dynamically calculated based on the specific players selected and their recent/historical data, not static placeholders.**
          
          Respond ONLY with a valid JSON object in this exact format:
          {
            "selectedPlayers": [
              {
                "name": "Player Name",
                "role": "ROLE",
                "team": "Team Name",
                "credits": 8.5, // Ensure credits are numbers
                "isCaptain": false,
                "isViceCaptain": false
              }
              // ... other players
            ],
            "totalCredits": 99.5, // Ensure total credits is a number
            "captain": "Player Name",
            "viceCaptain": "Player Name",
            "teamAnalysis": "Detailed analysis...",
            "teamStats": {
              "winProbability": 75, // Number
              "battingStrength": 80, // Number
              "bowlingStrength": 70, // Number
              "balanceRating": 85 // Number
            }
          }
        `,
        });
        const { response } = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `I'm building a fantasy cricket team for a match between ${
                    match.home
                  } and ${match.away}.
Here are all the available players with their roles, credits, and historical data:

${JSON.stringify(playersWithCredits, null, 2)}

**TOSS FACTOR:** Use Google Search to determine typical pitch behavior and toss impact at ${
                    match.venue
                  }. Factor this into your player selection and analysis (e.g., if dew makes batting second easier, favor players accordingly). Mention the assumed toss impact in your analysis.

Select the best 11 players that will score the most fantasy points. 
**Use Google Search to find the latest statistics for each player in the current season.**
Consider both the provided historical data AND the recent stats found via search. Prioritize players in good recent form.

**CRITICAL TEAM COMPOSITION RULES:**
The total sum of credits must be under 100.
Make sure to include at least:
- 1 wicketkeeper
- 1 all-rounder
- 3-5 batters
- 3-5 bowlers
**- Maximum of 7 players can be selected from a single team (${match.home} or ${
                    match.away
                  }).**

Also suggest a captain (2x points) and vice-captain (1.5x points) from the selected players.
IMPORTANT: Choose the captain and vice-captain based on their potential to score the most fantasy points (considering both history and recent form), NOT based on their real-life leadership roles. Captain should be your highest potential point-scoring player, and vice-captain should be your second-highest scoring potential player.

Base your selections on a combination of historical data and **current season performance (found via search)**. Use specific statistics (historical and recent) to justify each selection.

Provide a detailed team analysis that evaluates:
1. Each selected player individually with key historical and **recent** statistics (batting averages, strike rates, economy rates, wickets, etc.).
2. Recent form analysis using data obtained from search.
3. Detailed statistical justification for captain and vice-captain choices, referencing both historical and recent data.
4. Overall team balance and strategy with quantitative assessment.

Also provide team stats with the following values:
- winProbability: a number between 0-100 representing the team's chance of winning based on selected players' form and history.
- battingStrength: a number between 0-100 representing the team's batting quality.
- bowlingStrength: a number between 0-100 representing the team's bowling quality.
- balanceRating: a number between 0-100 representing how well-balanced the team is.
**Ensure these stats are dynamically calculated based on the specific players selected and their recent/historical data, not static placeholders.**

Respond ONLY with a valid JSON object in this exact format:
{
  "selectedPlayers": [
    {
      "name": "Player Name",
      "role": "ROLE",
      "team": "Team Name",
      "credits": 8.5,
      "isCaptain": false,
      "isViceCaptain": false
    }
  ],
  "totalCredits": 99.5,
  "captain": "Player Name",
  "viceCaptain": "Player Name",
  "teamAnalysis": "Detailed analysis...",
  "teamStats": {
    "winProbability": 75,
    "battingStrength": 80,
    "bowlingStrength": 70,
    "balanceRating": 85
  }
}`,
                },
              ],
            },
          ],
        });

        // Parse and structure the response
        let result: FantasyTeamResult;
        try {
          const responseText = response.text();
          const jsonMatch =
            responseText.match(/```json\n([\s\S]*?)\n```/) ||
            responseText.match(/{[\s\S]*?}/);

          if (jsonMatch) {
            let jsonStr = jsonMatch[0].startsWith("{")
              ? jsonMatch[0]
              : jsonMatch[1];

            // Clean up any potential control characters or invalid JSON
            jsonStr = jsonStr.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

            try {
              result = JSON.parse(jsonStr) as FantasyTeamResult;
            } catch (parseError) {
              console.error("JSON Parse Error:", parseError);
              // Return a valid default response instead of throwing
              return {
                selectedPlayers: [],
                totalCredits: 0,
                captain: "",
                viceCaptain: "",
                teamAnalysis:
                  "Team analysis will be available after selection.",
                teamStats: {
                  winProbability: 0,
                  battingStrength: 60,
                  bowlingStrength: 60,
                  balanceRating: 55,
                },
              };
            }
          } else {
            // Return default response instead of throwing
            return {
              selectedPlayers: [],
              totalCredits: 0,
              captain: "",
              viceCaptain: "",
              teamAnalysis: "Team analysis will be available after selection.",
              teamStats: {
                winProbability: 0,
                battingStrength: 60,
                bowlingStrength: 60,
                balanceRating: 55,
              },
            };
          }

          // Ensure teamStats exists
          if (!result.teamStats) {
            result.teamStats = {
              winProbability: 0,
              battingStrength: 60,
              bowlingStrength: 60,
              balanceRating: 55,
            };
          }

          // After parsing the AI response, validate players
          if (result.selectedPlayers) {
            const validPlayers = result.selectedPlayers.filter((player) =>
              validPlayerNames.includes(player.name)
            );

            if (validPlayers.length !== result.selectedPlayers.length) {
              console.error(
                "AI suggested invalid players:",
                result.selectedPlayers.filter(
                  (p) => !validPlayerNames.includes(p.name)
                )
              );
            }

            result.selectedPlayers = validPlayers;
            result.totalCredits = validPlayers.reduce(
              (sum, p) => sum + p.credits,
              0
            );
          }

          return result;
        } catch (error) {
          console.error("Failed to parse AI response:", error);
          // Return default response instead of throwing
          return {
            selectedPlayers: [],
            totalCredits: 0,
            captain: "",
            viceCaptain: "",
            teamAnalysis: "Team analysis will be available after selection.",
            teamStats: {
              winProbability: 0,
              battingStrength: 60,
              bowlingStrength: 60,
              balanceRating: 55,
            },
          };
        }
      } catch (err) {
        console.error("Error in getCream11:", err);
        // Return default response
        return {
          selectedPlayers: [],
          totalCredits: 0,
          captain: "",
          viceCaptain: "",
          teamAnalysis: "Team analysis will be available after selection.",
          teamStats: {
            winProbability: 0,
            battingStrength: 60,
            bowlingStrength: 60,
            balanceRating: 55,
          },
        };
      }
    });
  },
  // Use the correct model name or a generic identifier in the cache key
  // @ts-expect-error - unstable_cache key function type expects string[], but function returning string[] is correct usage
  (match: Match) => [
    `cream11-analysis-${match.home}-${match.away}-${match.date}`,
  ],
  {
    revalidate: 3600, // 1 hour
    tags: ["cream11-cache"],
  }
);

interface ExtendedSelectedPlayer extends SelectedPlayer {
  team: string;
}

export const getCustomTeamAnalysis = unstable_cache(
  async (
    match: Match,
    selectedPlayers: ExtendedSelectedPlayer[],
    aiSuggestedTeam: Player[] // Keep AI team for comparison context
  ) => {
    return withKeyRotation(async () => {
      try {
        // First get all players from both teams
        const allPlayers = await getPlaying11OfTeams(match);
        const playersCredits = await getPlayersCredits(match);
        const allPlayersWithHistory = Object.entries(
          allPlayers as Record<string, PlayerDetails[]>
        ).flatMap(([team, players]) =>
          players.map((player: PlayerDetails) => ({
            ...player,
            team,
            history: historicalData[player.name as keyof typeof historicalData],
            // Include credits here for the prompt context
            credits:
              playersCredits.find((p) => p.name === player.name)?.credits ||
              8.0,
          }))
        );

        const model = new GoogleGenerativeAI(
          API_KEYS[currentKeyIndex]
        ).getGenerativeModel({
          model: "models/gemini-2.0-flash",
          // Enable search for analysis if needed for recent form data
          // @ts-expect-error - googleSearch is not defined in the base types but is a valid tool
          tools: [{ googleSearch: {} }],
          systemInstruction: `You are an expert fantasy cricket analyst. Your task is to analyze a given user-selected fantasy team based on comprehensive historical data AND recent player form (use search). Compare it objectively against the available player pool and the AI's suggested optimal team (provided for reference).

          CRITICAL INSTRUCTIONS:
          1. Analyze the user's SELECTED TEAM provided in the prompt.
          2. Use Google Search to fetch RECENT PERFORMANCE data for all players involved (selected and alternatives).
          3. Base your analysis on BOTH historical data AND recent form found via search.
          4. Provide realistic statistics and justify them with data (historical and recent).
          5. Objectively evaluate strengths and weaknesses compared to the entire player pool and the AI's reference team.
          6. Calculate performance metrics (win probability, strengths, balance) based on the data for the SELECTED TEAM.
          7. If the selected team differs from the AI team, explain the potential impact (positive or negative) based on data, acknowledging risks and trade-offs. Avoid definitive statements that the AI team is *always* better without justification.
          8. Use exact statistical values from historical data and recent search results.
          9. Factor in team composition, player roles, and credit constraints.
          
          ${fantasyCricketRules}`,
        });

        const { response } = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `
                  Analyze this user-selected fantasy cricket team for the ${
                    match.home
                  } vs ${match.away} match.

                  COMPLETE HISTORICAL DATA & CREDITS OF ALL AVAILABLE PLAYERS:
                  ${JSON.stringify(allPlayersWithHistory, null, 2)}

                  USER'S SELECTED TEAM TO ANALYZE:
                  ${JSON.stringify(selectedPlayers, null, 2)}

                  AI'S SUGGESTED REFERENCE TEAM (Optimal based on its analysis):
                  ${JSON.stringify(aiSuggestedTeam, null, 2)}

                  IMPORTANT ANALYSIS REQUIREMENTS:
                  1. Use Google Search to find the LATEST stats/form for all relevant players.
                  2. Provide a player-by-player analysis of the SELECTED TEAM, integrating historical data and RECENT FORM (from search). Justify inclusion/exclusion based on data.
                  3. Compare selected players against key available alternatives in their roles, using recent performance data.
                  4. Calculate realistic team statistics (win probability, batting/bowling strength, balance) for the SELECTED TEAM based on combined historical and recent data. Explain the reasoning.
                  5. Provide a "Comparison with Optimal" section:
                      - Identify key differences between the selected team and the AI reference team.
                      - Analyze potential performance deltas (win probability, points potential) based on data differences (e.g., "Player A selected over Player B might increase batting strength but lower bowling strength due to recent form...").
                      - Highlight potential risks and missed opportunities in the selected team compared to alternatives.
                  6. Ensure all analysis is backed by specific statistical data (historical and recent).
                  7. Priortize the current season performance over the historical data.

                  Respond ONLY with a valid JSON object in this exact format:
                  {
                    "selectedPlayers": ${JSON.stringify(
                      selectedPlayers
                    )}, // Echo back the analyzed team
                    "totalCredits": ${selectedPlayers.reduce(
                      (sum, p) => sum + p.credits,
                      0
                    )}, // Calculate actual credits
                    "captain": "${
                      selectedPlayers.find((p) => p.isCaptain)?.name || "N/A"
                    }",
                    "viceCaptain": "${
                      selectedPlayers.find((p) => p.isViceCaptain)?.name ||
                      "N/A"
                    }",
                    "teamAnalysis": "Detailed player-by-player analysis integrating historical and recent (searched) data, justification for stats...",
                    "teamStats": {
                      "winProbability": number (0-100),
                      "battingStrength": number (0-100),
                      "bowlingStrength": number (0-100),
                      "balanceRating": number (0-100)
                    },
                    "comparisonWithOptimal": {
                      "keyDifferences": ["Player A vs Player B", "..."],
                      "performanceImpactAnalysis": "Analysis of how differences affect potential points, win probability based on data...",
                      "riskFactors": ["Reliance on out-of-form player X", "..."],
                      "missedOpportunities": ["Not selecting in-form Player Y", "..."]
                    }
                  }
                  `,
                },
              ],
            },
          ],
        });

        // Parse and return the AI's analysis
        let responseText = "";
        let jsonStr = ""; // Declare outside try block
        let cleanedJson = ""; // Declare outside try block
        try {
          responseText = response.text();
          console.log("Raw AI Response Text:", responseText); // Added for debugging
          const jsonMatch =
            responseText.match(/```json\n([\s\S]*?)\n```/) ||
            responseText.match(/{[\s\S]*?}/);

          if (!jsonMatch) {
            console.error(
              "Failed JSON extraction. Could not find JSON block in raw response:",
              responseText
            );
            throw new Error("Could not extract JSON from response");
          }

          jsonStr = jsonMatch[0].startsWith("{") ? jsonMatch[0] : jsonMatch[1];

          console.log("Extracted JSON String:", jsonStr); // Added for debugging

          // Add additional JSON cleanup (Attempting cleanup, might be fragile)
          // Consider more robust JSON parsing if this fails often
          cleanedJson = jsonStr
            .replace(/\\/g, "") // Basic backslash removal
            // Simple attempt to quote keys, might break with complex strings
            // .replace(/(\s*"?[\w]+"?\s*):/g, '"$1":')
            // Safer not to aggressively clean keys, rely on model format
            .replace(/'/g, '"'); // Replace single quotes

          console.log("Cleaned JSON String (attempted):", cleanedJson); // Added for debugging

          const parsedResult = JSON.parse(cleanedJson);

          // Check if teamAnalysis is empty or missing
          if (!parsedResult.teamAnalysis || !parsedResult.teamAnalysis.trim()) {
            console.warn(
              "AI returned valid JSON but with empty teamAnalysis. Setting default message."
            );
            parsedResult.teamAnalysis =
              "AI analysis could not be generated for this specific team configuration. Please ensure your team selection is valid.";
          }

          // Ensure teamStats exists, provide defaults if not
          if (!parsedResult.teamStats) {
            console.warn(
              "AI returned valid JSON but missing teamStats. Setting default stats."
            );
            parsedResult.teamStats = {
              winProbability: 0,
              battingStrength: 0,
              bowlingStrength: 0,
              balanceRating: 0,
            };
          }

          return parsedResult;
        } catch (error) {
          console.error("Failed to parse AI response:", {
            error,
            responseText,
            extractedJsonString: jsonStr, // Log extracted string (will be empty if extraction failed)
            cleanedJsonString: cleanedJson, // Log cleaned string (will be empty if cleaning/parsing failed before this)
          });
          throw new Error(
            "Failed to analyze team. Please check your selections."
          );
        }
      } catch (err) {
        console.error("Error in getCustomTeamAnalysis:", err);
        throw new Error(
          "Failed to generate team analysis. Please try again later."
        );
      }
    });
  },
  // @ts-expect-error - unstable_cache key function type expects string[], but function returning string[] is correct usage
  (match: Match, selectedPlayers: ExtendedSelectedPlayer[]) => [
    `custom-team-analysis-${match.home}-${match.away}-${match.date}`,
    JSON.stringify(selectedPlayers.map((p) => p.name).sort()), // Key depends on selected player names
  ],
  { revalidate: 3600, tags: ["team-analysis-cache"] }
);

export async function getPlaying11OfTeams(match: Match) {
  return withKeyRotation(async (genAI) => {
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
        
      The player roles should be one of: BATTER, BOWLER, ALL_ROUNDER, or WICKET_KEEPER.
      Make sure to include accurate player information including their correct role, captain/vice-captain status, and impact player status.
      
      DO NOT include image URLs in your response. The image URLs will be added from our database separately.`,
      });

      const { response } = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Give me the playing 11 players for ${match.home} vs ${match.away} match on ${match.date} at ${match.venue} with complete player details including role, captain, vice-captain, and impact player status. DO NOT include image URLs in your response.`,
              },
            ],
          },
        ],
      });

      const playersData = JSON.parse(
        response
          .text()
          .replace(/^```json\n/, "")
          .replace(/\n```$/, "")
          .replaceAll("\n", "")
      ) as Record<string, PlayerDetails[]>;

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
  });
}
