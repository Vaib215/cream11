import axios from "axios"

interface TeamInfo {
    name: string;
    shortname: string;
    img: string;
}

interface Score {
    r: number;
    w: number;
    o: number;
    inning: string;
}

interface Match {
    id: string;
    name: string;
    matchType: string;
    status: string;
    venue: string;
    date: string;
    dateTimeGMT: string;
    teams: string[];
    teamInfo: TeamInfo[];
    score: Score[];
    series_id: string;
    fantasyEnabled: boolean;
    bbbEnabled: boolean;
    hasSquad: boolean;
    matchStarted: boolean;
    matchEnded: boolean;
}

export const getUpcomingMatches = async (): Promise<Match[]> => {
    try {
        const { data } = await axios.get(`https://api.cricapi.com/v1/matches?apikey=${process.env.CRICAPI_KEY}&offset=0`);
        return data.data;
    } catch (error) {
        console.error('Error in getUpcomingMatches:', error);
        return [];
    }
}