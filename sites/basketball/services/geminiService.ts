import { Ollama } from "ollama";
import type { Game, Lineup } from "../types";
import { TEAM_COMPOSITION_RULES, SCORING_SYSTEM } from "../constants";

const ollama = new Ollama({
  host: import.meta.env.VITE_OLLAMA_HOST || "http://localhost:11434",
});

const MODEL = import.meta.env.VITE_OLLAMA_MODEL || "gemma3:1b";

const generateContentWithFallback = async (
  prompt: string,
  options?: { format?: "json" }
) => {
  try {
    const response = await ollama.generate({
      model: MODEL,
      prompt,
      format: options?.format,
    });
    return { text: response.response };
  } catch (error: any) {
    console.error("Ollama error details:", error);

    // Handle CORS/network errors (browser can't connect to Ollama)
    if (
      error.message?.includes("fetch") ||
      error.message?.includes("NetworkError") ||
      error.code === "ECONNREFUSED"
    ) {
      throw new Error(
        "Cannot connect to Ollama. Make sure:\n1. Ollama is running (ollama serve)\n2. CORS is enabled: OLLAMA_ORIGINS=* ollama serve\n3. Or use a backend proxy for production"
      );
    }

    // Handle Ollama-specific errors
    if (error.message && error.message.includes("connection")) {
      throw new Error(
        "Ollama server is not running. Please start Ollama with: OLLAMA_ORIGINS=* ollama serve"
      );
    }
    if (
      error.message &&
      error.message.includes("model") &&
      error.message.includes("not found")
    ) {
      throw new Error(
        `Model '${MODEL}' not found. Download it with: ollama pull ${MODEL}`
      );
    }
    throw error;
  }
};

const cleanJsonString = (str: string): string => {
  // Remove markdown backticks and 'json' language identifier
  let cleaned = str.replace(/```json/g, "").replace(/```/g, "");

  // Remove any text before the first '[' or '{' and after the last ']' or '}'
  const jsonStart = Math.min(
    cleaned.indexOf("[") !== -1 ? cleaned.indexOf("[") : Infinity,
    cleaned.indexOf("{") !== -1 ? cleaned.indexOf("{") : Infinity
  );

  if (jsonStart !== Infinity) {
    cleaned = cleaned.substring(jsonStart);
  }

  const jsonEndArray = cleaned.lastIndexOf("]");
  const jsonEndObject = cleaned.lastIndexOf("}");
  const jsonEnd = Math.max(jsonEndArray, jsonEndObject);

  if (jsonEnd !== -1) {
    cleaned = cleaned.substring(0, jsonEnd + 1);
  }

  return cleaned.trim();
};

const parseJsonWithFixes = (jsonString: string): any => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn(
      "JSON parsing failed, attempting to fix common issues:",
      error
    );

    // Try to fix common JSON issues
    let fixedJson = jsonString
      .replace(/,\s*}/g, "}") // Remove trailing commas in objects
      .replace(/,\s*]/g, "]") // Remove trailing commas in arrays
      .replace(/'/g, '"') // Replace single quotes with double quotes
      .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*):/g, '$1"$2":'); // Quote unquoted keys

    return JSON.parse(fixedJson);
  }
};

// Note: fetchUpcomingGames is now in nbaDataService.ts
// This file only handles AI-powered lineup generation
export { fetchUpcomingGames } from "./nbaDataService";

const lineupSchemaDescription = `
Your response must be a valid JSON object with the following structure:
{
  "lineup": [
    {
      "name": "Player's full name (string)",
      "team": "Player's NBA team abbreviation (string, e.g., LAL, BOS)",
      "position": "Player's primary position (string, one of: PG, SG, SF, PF, C)",
      "salary": "Player's fantasy salary (number between 3500 and 12000)",
      "role": "Player's role (string, one of: Captain, Star Player, Player)",
      "analysis": "Brief analysis (string, 1-2 sentences) on why this player was selected"
    }
  ],
  "totalSalary": "The total salary of all 8 players (number, must not exceed 50000)",
  "reasoning": "Overall strategy for this lineup build (string)"
}

The lineup array must contain exactly 8 player objects.
`;

export const generateFantasyLineup = async (game: Game): Promise<Lineup> => {
  const prompt = `
    You are an expert NBA fantasy basketball analyst for an app called "Cream11".
    Your task is to generate the single most optimal fantasy lineup for the upcoming NBA game between the ${game.teamA.name} and the ${game.teamB.name}.

    You MUST use your built-in knowledge to factor in the latest player stats, injury reports, recent performance trends, and specific matchup advantages.

    Strictly adhere to ALL of the following fantasy rules:
    ${TEAM_COMPOSITION_RULES}

    The scoring system is as follows. Use this to determine player value:
    ${SCORING_SYSTEM}

    Your goal is to create the highest-scoring lineup possible while following all rules. Pay close attention to value picks (players with high potential and lower salary).

    ${lineupSchemaDescription}

    Return ONLY a valid JSON object. Do not include any text, markdown, or code block syntax before or after the JSON object.
  `;

  try {
    const { text } = await generateContentWithFallback(prompt, {
      format: "json",
    });

    const jsonString = cleanJsonString(text);
    const lineupData: Lineup = parseJsonWithFixes(jsonString);

    // Basic validation
    if (!lineupData.lineup || lineupData.lineup.length !== 8) {
      throw new Error("AI returned an invalid number of players.");
    }

    // Validate salary cap
    if (lineupData.totalSalary > 50000) {
      throw new Error("Total salary exceeds the $50,000 cap.");
    }

    return lineupData;
  } catch (error) {
    console.error("Error generating fantasy lineup:", error);
    let errorMessage = "Failed to generate lineup due to an error.";
    if (error instanceof Error) {
      errorMessage = `An error occurred: ${error.message}. Please check that Ollama is running.`;
    }
    throw new Error(errorMessage);
  }
};
