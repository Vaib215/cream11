
import { GoogleGenAI, Type } from "@google/genai";
import type { Game, Lineup } from '../types';
import { TEAM_COMPOSITION_RULES, SCORING_SYSTEM } from '../constants';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this context, we assume the key is set in the environment.
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const cleanJsonString = (str: string): string => {
    // Remove markdown backticks and 'json' language identifier
    let cleaned = str.replace(/```json/g, '').replace(/```/g, '');

    // Remove any text before the first '[' or '{' and after the last ']' or '}'
    const jsonStart = Math.min(
        cleaned.indexOf('[') !== -1 ? cleaned.indexOf('[') : Infinity,
        cleaned.indexOf('{') !== -1 ? cleaned.indexOf('{') : Infinity
    );

    if (jsonStart !== Infinity) {
        cleaned = cleaned.substring(jsonStart);
    }

    const jsonEndArray = cleaned.lastIndexOf(']');
    const jsonEndObject = cleaned.lastIndexOf('}');
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
        console.warn('JSON parsing failed, attempting to fix common issues:', error);

        // Try to fix common JSON issues
        let fixedJson = jsonString
            .replace(/,\s*}/g, '}')  // Remove trailing commas in objects
            .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
            .replace(/'/g, '"')     // Replace single quotes with double quotes
            .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*):/g, '$1"$2":'); // Quote unquoted keys

        return JSON.parse(fixedJson);
    }
};

export const fetchUpcomingGames = async (): Promise<{ games: Game[] }> => {
    try {
        const prompt = `
            First, search for all NBA games happening TODAY (US time: ${new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York' })}). If there are games today, return ALL of them.
            If NO games are happening today, then list the top 5 most anticipated upcoming NBA games in the next 7 days.
            If NO games are found even in the next 7 days, then find the 5 NBA games that will happen in the most recent future (beyond 7 days).
            Use Google Search to find the most up-to-date information from official NBA sources.
            For each game, provide the two teams playing (full team names), the date, time (EST), and arena/venue.
            Also include the official NBA team logos from cdn.nba.com for each team.
            
            Respond with ONLY a valid JSON array where each object represents a game with keys: "id" (generate unique string), "teamA" (object with "name" and "logo"), "teamB" (object with "name" and "logo"), "date", "time", and "arena". Do not include any other text or explanations.
            
            Example format:
            [
                {
                    "id": "1",
                    "teamA": { "name": "Los Angeles Lakers", "logo": "https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg" },
                    "teamB": { "name": "Boston Celtics", "logo": "https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg" },
                    "date": "Today",
                    "time": "7:30 PM EST",
                    "arena": "Crypto.com Arena"
                }
            ]
        `;

        const { text } = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const jsonString = cleanJsonString(text);
        const games: Game[] = parseJsonWithFixes(jsonString);

        return { games };

    } catch (error) {
        console.error("Error fetching upcoming games:", error);
        throw new Error('Failed to fetch upcoming NBA games. Please try again later.');
    }
};

const lineupSchema = {
  type: Type.OBJECT,
  properties: {
    lineup: {
      type: Type.ARRAY,
      description: "An array of exactly 8 player objects for the fantasy lineup.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Player's full name." },
          team: { type: Type.STRING, description: "Player's NBA team abbreviation (e.g., LAL, BOS)." },
          position: { type: Type.STRING, description: "Player's primary position (PG, SG, SF, PF, C).", enum: ["PG", "SG", "SF", "PF", "C"] },
          salary: { type: Type.INTEGER, description: "Player's fantasy salary between $3,500 and $12,000." },
          role: { type: Type.STRING, description: "Player's role: 'Captain', 'Star Player', or 'Player'.", enum: ["Captain", "Star Player", "Player"] },
          analysis: { type: Type.STRING, description: "Brief analysis (1-2 sentences) on why this player was selected, mentioning matchup, recent form, or value." }
        },
        required: ["name", "team", "position", "salary", "role", "analysis"]
      }
    },
    totalSalary: {
      type: Type.INTEGER,
      description: "The total salary of all 8 players in the lineup. Must not exceed $50,000."
    },
    reasoning: {
      type: Type.STRING,
      description: "Overall strategy for this lineup build (e.g., stars and scrubs, balanced approach) and how it counters the opponent."
    }
  },
  required: ["lineup", "totalSalary", "reasoning"]
};

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

    Return your response as a JSON object that conforms to the provided schema. Do not include any text, markdown, or code block syntax before or after the JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: lineupSchema,
      },
    });

    const jsonText = response.text.trim();
    const lineupData: Lineup = JSON.parse(jsonText);
    
    // Basic validation, although AI should adhere to the schema
    if (!lineupData.lineup || lineupData.lineup.length !== 8) {
        throw new Error("AI returned an invalid number of players.");
    }

    return lineupData;

  } catch (error) {
    console.error("Error generating fantasy lineup:", error);
    let errorMessage = "Failed to generate lineup due to an API error.";
    if (error instanceof Error) {
        errorMessage = `An error occurred: ${error.message}. Please check your API key and network connection.`;
    }
    throw new Error(errorMessage);
  }
};
