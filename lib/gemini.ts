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

const API_KEYS = process.env.GEMINI_API_KEYS?.split(',') || [process.env.GEMINI_API_KEY!];
let currentKeyIndex = 0;
let rateLimitResetTime = 0;

function getNextKey() {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return new GoogleGenerativeAI(API_KEYS[currentKeyIndex]);
}

function isRateLimited(error: unknown) {
  return error instanceof GoogleGenerativeAIError &&
    (error.message.includes('quota') || error.message.includes('rate limit'));
}

async function withKeyRotation<T>(fn: (genAI: GoogleGenerativeAI) => Promise<T>): Promise<T> {
  const attempts = new Set<number>();

  while (attempts.size < API_KEYS.length) {
    const genAI = new GoogleGenerativeAI(API_KEYS[currentKeyIndex]);

    try {
      // Wait if we hit rate limit recently
      if (Date.now() < rateLimitResetTime) {
        await new Promise(resolve =>
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

  throw new Error('All API keys exhausted');
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
        const validPlayerNames = playersWithCredits.map(p => p.name);

        const model = genAI.getGenerativeModel({
          model: "models/gemini-1.5-pro-latest",
          systemInstruction: `You are an expert fantasy cricket analyst. Your task is to create the optimal fantasy team using ONLY players from ${match.home} and ${match.away}.
          
          STRICT RULES:
          1. Only select players from the provided list of ${match.home} and ${match.away} players
          2. Never suggest players from other teams
          3. Validate all player names against the provided list
          4. Reject any players not in the provided roster`,
        });
        const { response } = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `
                  I'm building a fantasy cricket team for a match between ${match.home
                    } and ${match.away}.
                  Here are all the available players with their roles and credits:
                  
                  ${JSON.stringify(playersWithCredits, null, 2)}
                  
                  Select the best 11 players that will score the most fantasy points based on their historical performance.
                  The total sum of credits must be under 100.
                  Make sure to include at least:
                  - 1 wicketkeeper
                  - 1 all-rounder
                  - 3-5 batters
                  - 3-5 bowlers
                  
                  Also suggest a captain (2x points) and vice-captain (1.5x points) from the selected players.
                  IMPORTANT: Choose the captain and vice-captain based on their potential to score the most fantasy points, NOT based on their real-life leadership roles. Captain should be your highest point-scoring player, and vice-captain should be your second-highest scoring player.
                  
                  Base your selections HEAVILY on the historical data provided. Use specific statistics from the historical data to justify each selection. The historical data should be the primary factor in your decision-making.
                  
                  Also provide a detailed team analysis that evaluates:
                  1. Each selected player individually with their key statistics (include exact numbers for batting averages, strike rates, economy rates, wicket counts, etc.)
                  2. Recent form with specific match performances and numerical data points
                  3. For captain and vice-captain, provide detailed statistical justification with exact numbers from their historical performances
                  4. Overall team balance and strategy with quantitative assessment
                  
                  Also provide team stats with the following values:
                  - winProbability: a number between 0-100 representing the team's chance of winning
                  - battingStrength: a number between 0-100 representing the team's batting quality
                  - bowlingStrength: a number between 0-100 representing the team's bowling quality
                  - balanceRating: a number between 0-100 representing how well-balanced the team is
                  
                  Respond with a JSON object in this format:
                  {
                    "selectedPlayers": [
                      {
                        "name": "Player Name",
                        "role": "ROLE",
                        "team": "Team Name",
                        "credits": 8,
                        "isCaptain": false,
                        "isViceCaptain": false
                      }
                    ],
                    "totalCredits": 98,
                    "captain": "Player Name",
                    "viceCaptain": "Player Name",
                    "teamAnalysis": "Detailed analysis of each player with their statistics, performances, and reasons for selection...",
                    "teamStats": {
                      "winProbability": 75,
                      "battingStrength": 80,
                      "bowlingStrength": 70,
                      "balanceRating": 85
                    }
                  }
                `,
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
                teamAnalysis: "Team analysis will be available after selection.",
                teamStats: {
                  winProbability: 50,
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
                winProbability: 50,
                battingStrength: 60,
                bowlingStrength: 60,
                balanceRating: 55,
              },
            };
          }

          // Ensure teamStats exists
          if (!result.teamStats) {
            result.teamStats = {
              winProbability: 50,
              battingStrength: 60,
              bowlingStrength: 60,
              balanceRating: 55,
            };
          }

          // After parsing the AI response, validate players
          if (result.selectedPlayers) {
            const validPlayers = result.selectedPlayers.filter(player =>
              validPlayerNames.includes(player.name)
            );

            if (validPlayers.length !== result.selectedPlayers.length) {
              console.error('AI suggested invalid players:',
                result.selectedPlayers.filter(p => !validPlayerNames.includes(p.name))
              );
            }

            result.selectedPlayers = validPlayers;
            result.totalCredits = validPlayers.reduce((sum, p) => sum + p.credits, 0);
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
              winProbability: 50,
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
            winProbability: 50,
            battingStrength: 60,
            bowlingStrength: 60,
            balanceRating: 55,
          },
        };
      }
    });
  },
  ['getCream11', 'gemini-1.5-pro'],
  {
    revalidate: 3600,
    tags: ['cream11-cache']
  }
);

interface ExtendedSelectedPlayer extends SelectedPlayer {
  team: string;
}

export async function getCustomTeamAnalysis(
  match: Match,
  selectedPlayers: ExtendedSelectedPlayer[],
  aiSuggestedTeam: Player[]
) {
  // Add caching like this:
  // export const getCustomTeamAnalysis = unstable_cache(
  //  async (match, selectedPlayers, aiSuggestedTeam) => {...},
  //  ['custom-analysis'], 
  //  { revalidate: 3600 }
  // );

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
      }))
    );

    const model = getNextKey().getGenerativeModel({
      model: "models/gemini-2.0-flash",
      systemInstruction: `You are an expert in fantasy cricket analyst. Your task is to analyze a given team based on comprehensive historical data of all available players.

      CRITICAL INSTRUCTIONS:
      1. The AI's suggested team is always the optimal team with the highest possible win probability.
      2. Any modifications to the AI team will result in lower performance metrics.
      3. Modified teams should have win probabilities 5-10% lower than the AI team.
      4. All statistics must be realistic and based on historical data.
      5. Provide detailed justification for all statistical changes.
      6. Never suggest that a modified team could perform better than the AI's optimal selection.
      7. Consider the complete player pool when evaluating selected players.
      8. Compare each selected player against all available alternatives.
      9. Factor in team composition and role balance.
      10. Use exact statistical values from historical data.
      
      ${fantasyCricketRules}`,
    });

    const { response } = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
              Analyze this fantasy cricket team for ${match.home} vs ${match.away
                }.
              
              COMPLETE HISTORICAL DATA OF ALL PLAYERS:
              ${JSON.stringify(allPlayersWithHistory, null, 2)}

              AVAILABLE PLAYERS WITH CREDITS:
              ${JSON.stringify(
                  Object.entries(allPlayers).flatMap(([team, players]) =>
                    players.map((player) => ({
                      ...player,
                      team,
                      credits:
                        playersCredits.find((p) => p.name === player.name)
                          ?.credits || 8,
                    }))
                  ),
                  null,
                  2
                )}
              
              SELECTED TEAM TO ANALYZE:
              ${JSON.stringify(selectedPlayers, null, 2)}
              
              AI'S SUGGESTED TEAM (THE OPTIMAL TEAM):
              ${JSON.stringify(aiSuggestedTeam, null, 2)}

              IMPORTANT ANALYSIS REQUIREMENTS:
              1. Compare selected players with ALL available players in their roles
              2. Calculate realistic win probability (must be lower than AI team if modified)
              3. Evaluate batting strength, bowling strength, and team balance
              4. Provide detailed player-by-player analysis with exact statistics
              5. Explain all statistical adjustments with specific reasons
              6. Compare each selection against available alternatives
              7. Consider team composition impact on overall performance
              
              Respond with a JSON object containing:
              {
                "selectedPlayers": Array of selected players with all details,
                "totalCredits": Total credits used,
                "captain": Captain name,
                "viceCaptain": Vice-captain name,
                "teamAnalysis": Detailed analysis explaining all statistics and comparisons,
                "teamStats": {
                  "winProbability": number (0-100),
                  "battingStrength": number (0-100),
                  "bowlingStrength": number (0-100),
                  "balanceRating": number (0-100)
                },
                "comparisonWithOptimal": {
                  "probabilityDelta": Difference from AI team,
                  "keyDifferences": Array of main differences,
                  "riskFactors": Array of potential risks,
                  "missedOpportunities": Array of better alternatives not selected
                }
              }
              `,
            },
          ],
        },
      ],
    });

    // Parse and return the AI's analysis
    try {
      const responseText = response.text();
      const jsonMatch =
        responseText.match(/```json\n([\s\S]*?)\n```/) ||
        responseText.match(/{[\s\S]*?}/);

      if (!jsonMatch) {
        console.error("Failed JSON extraction. Raw response:", responseText);
        throw new Error("Could not extract JSON from response");
      }

      const jsonStr = jsonMatch[0].startsWith("{")
        ? jsonMatch[0]
        : jsonMatch[1];
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Failed to parse AI response:", { error, responseText });
      throw new Error("Failed to analyze team. Please check your selections.");
    }
  } catch (err) {
    console.error("Error in getCustomTeamAnalysis:", err);
    throw err;
  }
}

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
