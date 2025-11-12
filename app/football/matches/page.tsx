import { getFootballMatches, getFootballTeamById } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";

export default function FootballMatchesPage() {
  const allMatches = getFootballMatches();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Premier League Matches</h1>

        {allMatches.map((matchweek) => (
          <div key={matchweek.matchweek} className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              Matchweek {matchweek.matchweek}
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchweek.matches.map((match) => {
                const homeTeam = getFootballTeamById(match.homeTeam.id);
                const awayTeam = getFootballTeamById(match.awayTeam.id);

                return (
                  <Link
                    key={match.matchId}
                    href={`/football/match/${match.matchId}`}
                    className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-card"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        {homeTeam && (
                          <Image
                            src={homeTeam.logoUrl}
                            alt={homeTeam.name}
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">
                            {match.homeTeam.shortName}
                          </p>
                          {match.homeTeam.score !== undefined && (
                            <p className="text-2xl font-bold">
                              {match.homeTeam.score}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="px-4 text-muted-foreground">vs</div>

                      <div className="flex items-center gap-3 flex-1 flex-row-reverse">
                        {awayTeam && (
                          <Image
                            src={awayTeam.logoUrl}
                            alt={awayTeam.name}
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        )}
                        <div className="flex-1 text-right">
                          <p className="font-semibold">
                            {match.awayTeam.shortName}
                          </p>
                          {match.awayTeam.score !== undefined && (
                            <p className="text-2xl font-bold">
                              {match.awayTeam.score}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            match.period === "FullTime"
                              ? "bg-blue-500/20 text-blue-400"
                              : match.period === "PreMatch"
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {match.period}
                        </span>
                      </p>
                      <p>{new Date(match.kickoff).toLocaleString()}</p>
                      <p>{match.ground}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
