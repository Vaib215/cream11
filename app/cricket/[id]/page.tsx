import { withRetry } from "@/lib/cricket-ai";

export default async function CricketMatchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const data = (await searchParams).data;
  // @ts-expect-error - data is not defined in the types
  const decodedMatchData = JSON.parse(atob(data));
  const result = await withRetry(async (aiService) => {
    const systemPrompt = `You are a cricket expert. You will be given a cricket match data. You need to generate a fantasy team for the match.
        Use your knowledge about the match, players, teams, and other relevant information to make the best team selection.`;

    const prompt = `
        Match Data: ${JSON.stringify(decodedMatchData)}

        Return the best 11 players in the form of json
        `;

    const result = await aiService.generateJSON(prompt, {
      systemPrompt,
      temperature: 0.7,
    });
    return result;
  });
  return JSON.stringify(result);
}
