
import { GoogleGenAI } from "@google/genai";
import type { Match, DreamTeamResponse } from '../types';

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

export const fetchUpcomingMatches = async (): Promise<{ matches: Match[] }> => {
    try {
        const prompt = `
            First, search for all cricket matches happening TODAY(Indian time: ${new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })}). If there are matches today, return ALL of them.
            If NO matches are happening today, then list the top 5 most anticipated upcoming international or major league (e.g., IPL, BBL) cricket matches in the next 30 days.
            Use Google Search to find the most up-to-date information.
            For each match, provide the two teams playing, the tournament name, the full date, and the venue.
            Respond with ONLY a valid JSON array where each object represents a match with keys: "teamA", "teamB", "tournament", "date", and "venue". Do not include any other text or explanations.
        `;

        const { text } = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const jsonString = cleanJsonString(text);
        const matches: Match[] = parseJsonWithFixes(jsonString);

        return { matches };

    } catch (error) {
        console.error("Error fetching upcoming matches:", error);
        throw new Error('Failed to fetch upcoming matches. Please try again later.');
    }
};



export const generateDreamTeam = async (match: Match): Promise<DreamTeamResponse> => {
    try {
        const prompt = `
            For the upcoming cricket match between ${match.teamA} and ${match.teamB} in the ${match.tournament} on ${match.date} at ${match.venue}, create a Cream11 fantasy cricket team following these STRICT RULES:

            **CREAM11 TEAM COMPOSITION RULES (MUST FOLLOW EXACTLY):**
            - Total players: EXACTLY 11 players
            - Wicket-keepers: 1-4 players (minimum 1, maximum 4)
            - Batsmen: 3-6 players (minimum 3, maximum 6)
            - All-rounders: 1-4 players (minimum 1, maximum 4)
            - Bowlers: 3-6 players (minimum 3, maximum 6)
            - Maximum 7 players from one team (cannot exceed this limit)
            - Total budget: 100 credits (assign realistic credit values: star players 9.5-10.5, regular players 8.0-9.0, budget picks 7.0-8.5)
            - Must select 1 Captain (earns 2x points) and 1 Vice-Captain (earns 1.5x points)

            **CREAM11 SCORING SYSTEM TO CONSIDER:**
            Batting: +1 per run, +1 for boundary, +2 for six, +4 for 30 runs, +8 for 50 runs, +16 for 100 runs, -2 for duck
            Bowling: +25 per wicket, +4 for 3 wickets, +8 for 4 wickets, +16 for 5 wickets, +12 for maiden over
            Fielding: +8 for catch, +12 for stumping/direct run-out, +6 for run-out assist
            Economy (T20): +6 for <5 RPO, +4 for 5-5.99 RPO, +2 for 6-7 RPO, -2 for 8-9 RPO, -4 for 9-10 RPO, -6 for >10 RPO

            REASONING LOGIC:
            Comprehensive analysis explaining:
               - **Team Composition Validation**: Confirm the team meets all Cream11 rules (player counts, credit budget, team distribution)
               - **Captain & Vice-Captain Selection**: Justify choices based on recent form, consistency, and point-scoring potential
               - **Statistical Analysis**: Recent performance stats with specific numbers
               - **Form Analysis**: Last 5-10 matches performance
               - **Value Picks**: Explain budget-friendly players with high potential
               - **Risk Assessment**: Identify potential concerns and backup strategies
               - **Expected Points**: Rough point projections for key players
            
            Provide the following in JSON format:
            
            1. 'dreamTeam': Array of EXACTLY 11 players with: name, team, role ('Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'), credits (7.0-10.5), isCaptain (boolean), isViceCaptain (boolean)
            2. 'allPlayers': Complete squad lists from both teams with name, team, role, and estimated credits

            HERE is a sample of response: 
            {
                "dreamTeam": [
                    {
                        "name": "Player 1",
                        "team": "Team A",
                        "role": "Batsman",
                        "credits": 9.5,
                        "isCaptain": true,
                        "isViceCaptain": false
                    },
                    ...10 more players
                ],
                "allPlayers": [
                    {
                        "name": "Player 1",
                        "team": "Team A",
                        "role": "Batsman",
                        "credits": 9.5
                    },
                    ...other players
                ]
            }

            Use Google Search for current player statistics, recent form, and squad information.
            Respond with ONLY a valid JSON object containing 'dreamTeam' and 'allPlayers' keys.
            YOUR TEXT RESPONSE SHOULD ONLY BE A JSON AND NOTHING ELSE THAT TOO WITHOUT ANY \`\`\`json thing.
        `;

        const { candidates } = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                thinkingConfig: {
                    includeThoughts: true
                }
            }
        });

        const thinking = candidates.map(c => c.content.parts.filter(p => p.thought).map(p => p.text)).join('\n');
        const data = candidates.map(c => c.content.parts.filter(p => !p.thought).map(p => p.text)).join('');
        const result: DreamTeamResponse = parseJsonWithFixes(cleanJsonString(data));
        result.reasoning = thinking;

        return result;

    } catch (error) {
        console.error("Error generating dream team:", error);
        throw new Error('Failed to generate dream team. Please try again later.');
    }
};