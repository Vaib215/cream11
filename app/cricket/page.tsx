import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { FeedbackModal } from "@/components/feedback-modal";
import { HowToUseGuide } from "@/components/how-to-use-guide";
import { getUpcomingMatches } from "@/lib/circket-data";
import Link from "next/link";

export const revalidate = 60; // Revalidate page data every 60 seconds

dayjs.extend(utc);
dayjs.extend(timezone);
interface Match {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo: any[];
  score: any[];
  series_id: string;
  fantasyEnabled: boolean;
  bbbEnabled: boolean;
  hasSquad: boolean;
  matchStarted: boolean;
  matchEnded: boolean;
}

export default async function Home() {
  const upcomingMatches = await getUpcomingMatches();

  return (
    <main className="min-h-screen p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Cricket Live</h1>

        <div className="grid md:grid-cols-4 gap-4">
          {upcomingMatches?.map((match) => (
            <CricketCard key={match.id} match={match} />
          ))}
        </div>

        <div className="fixed bottom-4 right-4 flex gap-2">
          <FeedbackModal />
          <HowToUseGuide />
        </div>
      </div>
    </main>
  );
}
const CricketCard = ({ match }: { match: Match }) => {
  // encode data as base64
  const encodedMatchData = btoa(JSON.stringify(match));
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'live':
        return 'text-green-500';
      case 'completed':
        return 'text-blue-500';
      default:
        return 'text-orange-500';
    }
  };

  return (
    <Link href={`/cricket/${match.id}?data=${encodedMatchData}`}>
      <div className="border border-muted rounded-lg p-4 hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">
              {match.teams[0]} <span className="text-muted-foreground">vs</span> {match.teams[1]}
            </h2>
            <span className={`text-sm font-medium ${getStatusColor(match.status)}`}>
              {match.status}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {match.matchType}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">
              {dayjs(match.dateTimeGMT).format('DD MMM YYYY, hh:mm A')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-muted-foreground">
              {match.venue}
            </p>
          </div>

          {match.score && match.score.length > 0 && (
            <div className="mt-3 pt-3 border-t border-muted">
              {match.score.map((score: any, index: number) => (
                <p key={index} className="text-sm">
                  <span className="font-medium">{score.inning}:</span> {score.r}/{score.w} ({score.o} ov)
                </p>
              ))}
            </div>
          )}
        </div>

        {match.fantasyEnabled && (
          <div className="mt-3 pt-3 border-t border-muted flex items-center gap-2 text-sm text-green-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            Fantasy Available
          </div>
        )}
      </div>
    </Link>
  );
};
