import { withKeyRotation } from "@/lib/gemini";

export default async function CricketMatchPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const data = (await searchParams).data;
    // @ts-expect-error - data is not defined in the types
    const decodedMatchData = JSON.parse(atob(data));
    const result = await withKeyRotation(async (genAI) => {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            tools: [
                {
                    // @ts-expect-error - google_search is not defined in the types
                    google_search: {},
                },
            ],
        });
        const prompt = `
        You are a cricket expert. You will be given a cricket match data. You need to generate a fantasy team for the match.
        You can use internet to get the data and information about the match, players, teams, and other relevant information.
        Match Data: ${JSON.stringify(decodedMatchData)}

        Return the best 11 players in the form of json
        `;
        const result = await model.generateContent(prompt);
        return result;
    })
    return JSON.stringify(result);
}
