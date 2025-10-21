import { GoogleGenAI, Type } from "@google/genai";
import { Team, Match } from '../types';

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!API_KEY) {
    throw new Error("GEMINI_API_KEY or API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const generateContentWithFallback = async (params: any) => {
  try {
    // Try with gemini-2.5-flash first
    return await ai.models.generateContent({
      ...params,
      model: "gemini-2.5-flash",
    });
  } catch (error: any) {
    // Check if it's a 503 error
    if (error.status === 503 || (error.message && error.message.includes('503'))) {
      console.log('gemini-2.5-flash overloaded, falling back to gemini-2.5-flash-lite');
      return await ai.models.generateContent({
        ...params,
        model: "gemini-2.5-flash-lite",
        config: {
          ...params.config,
          thinkingConfig: {
            includeThoughts: false,
            maxTokens: 8192
          }
        }
      });
    }
    // If it's not a 503 error, re-throw it
    throw error;
  }
};

export const fetchUpcomingMatches = async (): Promise<Match[]> => {
    const prompt = `
        You are an expert sports data analyst. Your task is to find and list upcoming English Premier League matches.

        1.  First, identify the current date.
        2.  Then, find the official English Premier League fixtures page.
        3.  Extract ALL matches scheduled for the very next match day.
        4.  If that match day has fewer than 5 matches, continue to the following match day(s) until you have a list of AT LEAST 5 matches in total.
        5.  For each match, you MUST provide:
            - A unique numeric ID, starting from 1.
            - The home team, as an object with its full "name" and a valid "logo" URL. Use high-quality, reliable sources for logos (e.g., 'https://ssl.gstatic.com/onebox/media/sports/logos/...' or official site assets).
            - The away team, following the same structure.
            - The match date and time, formatted as "DAY, DD MON - HH:MM".

        Your response MUST be ONLY the JSON array. Do not include any introductory text, explanations, or markdown formatting like \`\`\`json.
        Your entire response must be a valid JSON array, starting with '[' and ending with ']'.

        Example of a single match object in the array:
        {
          "id": 1,
          "team1": {
            "name": "Manchester United",
            "logo": "https://ssl.gstatic.com/onebox/media/sports/logos/udQ6ns69OuOdeE3MYdpoPg_96x96.png"
          },
          "team2": {
            "name": "Fulham",
            "logo": "https://ssl.gstatic.com/onebox/media/sports/logos/Th4fAVAZeCJWRcKoLW7kAw_96x96.png"
          },
          "date": "FRI, 16 AUG - 20:00"
        }
    `;

    try {
        const response = await generateContentWithFallback({
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                temperature: 0.0,
            },
        });

        const rawText = response.text;
        if (!rawText || typeof rawText !== 'string' || rawText.trim() === '') {
            throw new Error("AI returned an empty or invalid response.");
        }

        const startIndex = rawText.indexOf('[');
        const endIndex = rawText.lastIndexOf(']');

        if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
            console.error("Invalid AI Response:", rawText);
            throw new Error("Could not find a valid JSON array in the AI's response.");
        }

        const jsonText = rawText.substring(startIndex, endIndex + 1);

        const matches = JSON.parse(jsonText);

        if (!Array.isArray(matches) || matches.length === 0) {
            throw new Error("AI did not return a valid array of matches.");
        }

        const firstMatch = matches[0];
        if (!firstMatch.id || !firstMatch.team1?.name || !firstMatch.team1?.logo || !firstMatch.team2?.name || !firstMatch.team2?.logo || !firstMatch.date) {
            throw new Error("The match data structure from the AI is incorrect or missing fields.");
        }

        return matches as Match[];

    } catch (error) {
        console.error("Error fetching upcoming matches from Gemini API:", error);
        if (error instanceof SyntaxError) {
            throw new Error("Failed to parse the match data from the AI. The response was not valid JSON.");
        }
        const message = error instanceof Error ? error.message : 'An unknown error occurred during fetch.';
        throw new Error(`Failed to get a valid response from the AI model for upcoming matches. Reason: ${message}`);
    }
};

const playerSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Full name of the player." },
        club: { type: Type.STRING, description: "The player's current club name." },
        reasoning: { type: Type.STRING, description: "A brief justification for selecting this player, focusing on FPL metrics like form, fixture difficulty, and potential for points." },
    },
    required: ["name", "club", "reasoning"],
};

const schema = {
    type: Type.OBJECT,
    properties: {
        formation: {
            type: Type.STRING,
            description: "The tactical formation of the team (e.g., 4-4-2, 4-3-3, 3-5-2)."
        },
        strategy: {
            type: Type.STRING,
            description: "A summary of the overall strategy for this team selection, considering the specific opponent and player choices."
        },
        team: {
            type: Type.OBJECT,
            properties: {
                goalkeeper: { type: Type.ARRAY, items: playerSchema, minItems: 1, maxItems: 1 },
                defenders: { type: Type.ARRAY, items: playerSchema, minItems: 3, maxItems: 5 },
                midfielders: { type: Type.ARRAY, items: playerSchema, minItems: 3, maxItems: 5 },
                forwards: { type: Type.ARRAY, items: playerSchema, minItems: 1, maxItems: 3 },
            },
            required: ["goalkeeper", "defenders", "midfielders", "forwards"],
        },
    },
    required: ["formation", "strategy", "team"],
};


export const generateFplTeam = async (team1: string, team2: string): Promise<Team> => {
    const prompt = `
        Generate the best possible Fantasy Premier League (FPL) team for the upcoming match week, considering the specific match between ${team1} and ${team2}.
        The team should consist of 11 players from ANY Premier League team. 
        Base your selections on player form, fixture difficulty for the gameweek, historical performance, and potential for FPL points (goals, assists, clean sheets).
        Provide a tactical formation and a brief overall strategy for the selections.
        Ensure the number of players in each position is valid for the chosen formation. For example, a 4-4-2 formation should have 1 goalkeeper, 4 defenders, 4 midfielders, and 2 forwards.
    `;

    try {
        const response = await generateContentWithFallback({
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.7,
            },
        });

        const text = response.text.trim();
        const parsedResponse = JSON.parse(text);

        if (!parsedResponse.formation || !parsedResponse.team) {
            throw new Error("AI response is missing required fields.");
        }

        return parsedResponse as Team;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get a valid response from the AI model.");
    }
};