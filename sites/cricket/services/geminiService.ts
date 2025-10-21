
import { GoogleGenAI } from "@google/genai";
import type { Match, DreamTeamResponse, Player } from '../types';

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

// --- Helper functions to enforce team constraints locally ---
const getTotalCredits = (team: Player[]) => team.reduce((sum, p) => sum + (typeof p.credits === 'number' ? p.credits : 0), 0);

const countByTeam = (team: Player[]) => team.reduce<Record<string, number>>((acc, p) => {
    acc[p.team] = (acc[p.team] || 0) + 1;
    return acc;
}, {});

const playerKey = (p: Player) => `${p.name}|${p.team}|${p.role}`;

const ensureNumericCredits = (p: Player): Player => ({
    ...p,
    credits: typeof p.credits === 'number' && !Number.isNaN(p.credits) ? p.credits : 8,
});

// Ensure exactly one Captain and one Vice-Captain are set. If missing, assign by highest credits
const ensureCaptainVice = (team: Player[]): Player[] => {
    const hasCaptain = team.some(p => p.isCaptain);
    const hasVice = team.some(p => p.isViceCaptain);

    // Reset duplicates if any
    let updated = team.map(p => ({ ...p }));
    if (!hasCaptain || !hasVice) {
        // Clear all flags first
        updated = updated.map(p => ({ ...p, isCaptain: false, isViceCaptain: false }));
        const sorted = [...updated].sort((a, b) => (b.credits || 0) - (a.credits || 0));
        if (sorted[0]) sorted[0].isCaptain = true;
        if (sorted[1]) sorted[1].isViceCaptain = true;
    }
    return updated;
};

// Build the cheapest possible team that matches the given role counts and team cap constraints
const buildCheapestTeamWithRoleCounts = (allPlayersIn: Player[], targetCounts: Record<string, number>): Player[] => {
    const allPlayers = allPlayersIn.map(ensureNumericCredits);
    const selected: Player[] = [];
    const teamCounts: Record<string, number> = {};

    const byRole: Record<string, Player[]> = {};
    for (const role of Object.keys(targetCounts)) {
        byRole[role] = allPlayers
            .filter(p => p.role === role)
            .sort((a, b) => (a.credits || 0) - (b.credits || 0));
    }

    for (const role of Object.keys(targetCounts)) {
        const need = targetCounts[role] || 0;
        for (const cand of byRole[role]) {
            if (selected.length >= 11) break;
            if (selected.filter(p => p.role === role).length >= need) break;
            const key = playerKey(cand);
            if (selected.some(p => playerKey(p) === key)) continue;
            const afterCount = (teamCounts[cand.team] || 0) + 1;
            if (afterCount > 7) continue;
            selected.push(cand);
            teamCounts[cand.team] = afterCount;
            if (selected.filter(p => p.role === role).length >= need) break;
        }
    }

    return selected.length === 11 ? selected : selected;
};

const adjustDreamTeamForBudget = (dreamTeamIn: Player[], allPlayersIn: Player[], creditLimit = 100): Player[] => {
    // Normalize credits
    let dreamTeam = dreamTeamIn.map(ensureNumericCredits);
    const allPlayers = allPlayersIn.map(ensureNumericCredits);

    // Build a quick lookup of players already in team
    const inTeam = new Set(dreamTeam.map(playerKey));

    // While we exceed budget, try greedy replacements by role
    const safeGuardMaxIterations = 50; // avoid infinite loops
    let iter = 0;
    while (getTotalCredits(dreamTeam) > creditLimit && iter < safeGuardMaxIterations) {
        iter++;
        // Sort current players by credits desc (try replacing most expensive first)
        const sortedByCost = [...dreamTeam].sort((a, b) => (b.credits || 0) - (a.credits || 0));
        let replaced = false;

        for (const current of sortedByCost) {
            // Find cheapest viable replacement of the same role not already in team
            const candidates = allPlayers
                .filter(p => p.role === current.role && playerKey(p) !== playerKey(current))
                .filter(p => (p.credits || 0) < (current.credits || 0))
                .filter(p => !dreamTeam.some(t => playerKey(t) === playerKey(p)))
                .sort((a, b) => (a.credits || 0) - (b.credits || 0));

            const currentWithout = dreamTeam.filter(p => playerKey(p) !== playerKey(current));
            const currentTeamCounts = countByTeam(currentWithout);

            for (const cand of candidates) {
                // Check team cap (<=7 from one side)
                const afterCount = (currentTeamCounts[cand.team] || 0) + 1;
                if (afterCount > 7) continue;

                const newTeam = [...currentWithout, cand];
                if (getTotalCredits(newTeam) <= getTotalCredits(dreamTeam)) {
                    // Accept only if it doesn't increase cost
                    dreamTeam = newTeam;
                    inTeam.delete(playerKey(current));
                    inTeam.add(playerKey(cand));
                    replaced = true;
                    break;
                }
            }
            if (replaced) break;
        }

        if (!replaced) {
            // No viable replacement found; stop iterating to avoid infinite loop
            break;
        }
    }

    // If still over budget, rebuild a cheapest-valid team with same role counts
    if (getTotalCredits(dreamTeam) > creditLimit) {
        const roleCounts = dreamTeam.reduce<Record<string, number>>((acc, p) => {
            acc[p.role] = (acc[p.role] || 0) + 1;
            return acc;
        }, {});
        const rebuilt = buildCheapestTeamWithRoleCounts(allPlayers, roleCounts);
        if (rebuilt.length === 11 && getTotalCredits(rebuilt) <= creditLimit) {
            dreamTeam = rebuilt;
        }
    }

    // Final clamp: round to one decimal to avoid float precision causing 100.0000001
    dreamTeam = dreamTeam.map(p => ({ ...p, credits: Math.round(((p.credits || 0) + Number.EPSILON) * 10) / 10 }));

    // Ensure captain/vice-captain present
    dreamTeam = ensureCaptainVice(dreamTeam);

    return dreamTeam;
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

        const { text } = await generateContentWithFallback({
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

        const { candidates } = await generateContentWithFallback({
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

        // --- Post-processing: enforce budget locally ---
        if (result?.dreamTeam?.length && result?.allPlayers?.length) {
            const adjustedTeam = adjustDreamTeamForBudget(result.dreamTeam as Player[], result.allPlayers as Player[], 100);
            result.dreamTeam = adjustedTeam;
        }

        return result;

    } catch (error) {
        console.error("Error generating dream team:", error);
        throw new Error('Failed to generate dream team. Please try again later.');
    }
};