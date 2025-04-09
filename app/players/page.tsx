import teamsData from "@/data/ipl_2025_teams.json";
import Image from "next/image";
import Link from "next/link";

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
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="text-blue-500 hover:underline mb-4 block">
        &larr; Back to Matches
      </Link>
      <h1 className="text-3xl font-bold mb-8 text-center">IPL 2024 Players</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(teamsData).map(([teamName, teamData]) => (
          <div
            key={teamName}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            style={{ borderTop: `4px solid ${teamData.colors.color}` }}
          >
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={teamData.logo}
                alt={teamName}
                width={100}
                height={100}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg truncate">{teamName}</h3>
              <ul className="list-disc list-inside">
                {teamData.players.map((player, index) => (
                  <li key={index} className="text-gray-600 text-sm">
                    {player}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
