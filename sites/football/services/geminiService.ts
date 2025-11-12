import { Ollama } from "ollama";
import { Team, Match } from "../types";

const OLLAMA_HOST =
  import.meta.env.VITE_OLLAMA_HOST || "http://localhost:11434";
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || "gemma3:1b";

const ollama = new Ollama({ host: OLLAMA_HOST });

const generateContentWithFallback = async (
  prompt: string,
  options?: { jsonMode?: boolean; temperature?: number }
) => {
  try {
    const response = await ollama.generate({
      model: OLLAMA_MODEL,
      prompt,
      format: options?.jsonMode ? "json" : undefined,
      options: {
        temperature: options?.temperature ?? 0.7,
      },
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
    if (
      error.message?.includes("connection") ||
      error.code === "ECONNREFUSED"
    ) {
      throw new Error(
        "Ollama server is not running. Please start Ollama with: OLLAMA_ORIGINS=* ollama serve"
      );
    }
    if (
      error.message?.includes("model") &&
      error.message?.includes("not found")
    ) {
      throw new Error(
        `Model '${OLLAMA_MODEL}' not found. Download it with: ollama pull ${OLLAMA_MODEL}`
      );
    }
    throw error;
  }
};

// Note: fetchUpcomingMatches is now in footballDataService.ts
// This file only handles AI-powered team generation
export { fetchUpcomingMatches } from "./footballDataService";

export const generateFplTeam = async (
  team1: string,
  team2: string
): Promise<Team> => {
  const prompt = `
        Generate the best possible Fantasy Premier League (FPL) team for the upcoming match week, considering the specific match between ${team1} and ${team2}.
        The team should consist of 11 players from ANY Premier League team. 
        Base your selections on player form, fixture difficulty for the gameweek, historical performance, and potential for FPL points (goals, assists, clean sheets).
        Provide a tactical formation and a brief overall strategy for the selections.
        Ensure the number of players in each position is valid for the chosen formation. For example, a 4-4-2 formation should have 1 goalkeeper, 4 defenders, 4 midfielders, and 2 forwards.

        You MUST respond with a JSON object in the following format:
        {
          "formation": "4-4-2",
          "strategy": "A summary of the overall strategy...",
          "team": {
            "goalkeeper": [
              {
                "name": "Player Name",
                "club": "Club Name",
                "reasoning": "Brief justification..."
              }
            ],
            "defenders": [
              {
                "name": "Player Name",
                "club": "Club Name",
                "reasoning": "Brief justification..."
              }
            ],
            "midfielders": [
              {
                "name": "Player Name",
                "club": "Club Name",
                "reasoning": "Brief justification..."
              }
            ],
            "forwards": [
              {
                "name": "Player Name",
                "club": "Club Name",
                "reasoning": "Brief justification..."
              }
            ]
          }
        }

        Ensure:
        - goalkeeper array has exactly 1 player
        - defenders array has 3-5 players
        - midfielders array has 3-5 players
        - forwards array has 1-3 players
        - Total of 11 players
        - Each player has name, club, and reasoning fields
    `;

  try {
    const response = await generateContentWithFallback(prompt, {
      jsonMode: true,
      temperature: 0.7,
    });

    const text = response.text.trim();
    const parsedResponse = JSON.parse(text);

    if (!parsedResponse.formation || !parsedResponse.team) {
      throw new Error("AI response is missing required fields.");
    }

    // Validate team structure
    const team = parsedResponse.team;
    if (
      !team.goalkeeper ||
      !Array.isArray(team.goalkeeper) ||
      team.goalkeeper.length !== 1
    ) {
      throw new Error("Team must have exactly 1 goalkeeper.");
    }
    if (
      !team.defenders ||
      !Array.isArray(team.defenders) ||
      team.defenders.length < 3 ||
      team.defenders.length > 5
    ) {
      throw new Error("Team must have 3-5 defenders.");
    }
    if (
      !team.midfielders ||
      !Array.isArray(team.midfielders) ||
      team.midfielders.length < 3 ||
      team.midfielders.length > 5
    ) {
      throw new Error("Team must have 3-5 midfielders.");
    }
    if (
      !team.forwards ||
      !Array.isArray(team.forwards) ||
      team.forwards.length < 1 ||
      team.forwards.length > 3
    ) {
      throw new Error("Team must have 1-3 forwards.");
    }

    return parsedResponse as Team;
  } catch (error) {
    console.error("Error calling Ollama API:", error);
    throw new Error("Failed to get a valid response from the AI model.");
  }
};
