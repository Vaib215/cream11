import teamsData from "@/data/ipl_2025_teams.json";

interface Player {
  name: string;
  imageUrl: string;
  team: string;
  teamColor?: string;
}

interface TeamData {
  players: string[];
  logo: string;
  colors: {
    color: string;
    secondaryColor: string;
  };
}

interface TeamsData {
  [teamName: string]: TeamData;
}

export default async function PlayersPage() {
  const allPlayers: Player[] = [];
  Object.entries(teamsData as Record<string, TeamData>).forEach(
    ([teamName, teamData]) => {
      teamData.players.forEach((player) => {
        allPlayers.push({
          name: player,
          imageUrl: `/players/${player
            .toLowerCase()
            .replace(/[\s-]+/g, "_")
            .replaceAll(".", "")}.webp`,
          team: teamName,
          teamColor: teamData.colors.color,
        });
      });
    }
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">IPL 2025 Players</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {allPlayers.map((player, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            style={{ borderTop: `4px solid ${player.teamColor}` }}
          >
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src={player.imageUrl}
                alt={player.name}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg truncate">{player.name}</h3>
              <p className="text-gray-600 text-sm">{player.team}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
