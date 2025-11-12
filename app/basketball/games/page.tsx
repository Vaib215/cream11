import { getNBAGames, getNBATeamById } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";

export default function NBAGamesPage() {
  const allGames = getNBAGames();

  // Group games by date
  const gamesByDate = allGames.reduce((acc, game) => {
    const date = game.gameDate.split(" ")[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(game);
    return acc;
  }, {} as Record<string, typeof allGames>);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">NBA Games</h1>

        {Object.entries(gamesByDate).map(([date, games]) => (
          <div key={date} className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              {new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game) => {
                const homeTeam = getNBATeamById(game.homeTeam.teamId);
                const awayTeam = getNBATeamById(game.awayTeam.teamId);

                return (
                  <Link
                    key={game.gameId}
                    href={`/basketball/game/${game.gameId}`}
                    className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-card"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        {awayTeam && (
                          <Image
                            src={awayTeam.logoUrl}
                            alt={awayTeam.teamName}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">
                            {game.awayTeam.teamTricode}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {game.awayTeam.wins}-{game.awayTeam.losses}
                          </p>
                          {game.awayTeam.score > 0 && (
                            <p className="text-2xl font-bold">
                              {game.awayTeam.score}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="px-4 text-muted-foreground">@</div>

                      <div className="flex items-center gap-3 flex-1 flex-row-reverse">
                        {homeTeam && (
                          <Image
                            src={homeTeam.logoUrl}
                            alt={homeTeam.teamName}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                        )}
                        <div className="flex-1 text-right">
                          <p className="font-semibold">
                            {game.homeTeam.teamTricode}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {game.homeTeam.wins}-{game.homeTeam.losses}
                          </p>
                          {game.homeTeam.score > 0 && (
                            <p className="text-2xl font-bold">
                              {game.homeTeam.score}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            game.gameStatusText.includes("Final")
                              ? "bg-blue-500/20 text-blue-400"
                              : game.gameStatusText.includes("PreMatch")
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {game.gameStatusText}
                        </span>
                      </p>
                      <p>{game.arenaName}</p>
                      {game.gameLabel && (
                        <p className="text-xs">{game.gameLabel}</p>
                      )}
                    </div>

                    {game.pointsLeaders && game.pointsLeaders.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs font-semibold mb-1">
                          Top Scorer:
                        </p>
                        <p className="text-sm">
                          {game.pointsLeaders[0].firstName}{" "}
                          {game.pointsLeaders[0].lastName} -{" "}
                          {game.pointsLeaders[0].points} pts
                        </p>
                      </div>
                    )}
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
