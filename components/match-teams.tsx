import Image from "next/image";
import { Crown, Shield, Zap, Target, UserRound, Activity } from "lucide-react";
import { PlayerDetails } from "@/types/player";

interface MatchTeamsProps {
  teams: Record<
    string,
    {
      players: PlayerDetails[];
      color: string;
      secondaryColor: string;
      logo?: string;
    }
  >;
  teamNames: string[];
}

export function MatchTeams({ teams, teamNames }: MatchTeamsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {teamNames.map((teamName) => (
        <div
          key={teamName}
          className="space-y-4 bg-white dark:bg-gray-800/50 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div
            className="flex items-center justify-between pb-3 border-b-2"
            style={{
              borderColor: teams[teamName].color,
            }}
          >
            <div className="flex items-center">
              {teams[teamName].logo ? (
                <div
                  className="h-12 w-12 mr-3 relative p-1 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: `${teams[teamName].color}15`,
                    boxShadow: `0 0 10px ${teams[teamName].color}30`,
                  }}
                >
                  <Image
                    src={teams[teamName].logo as string}
                    alt={`${teamName} logo`}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              ) : (
                <div
                  className="h-4 w-4 rounded-full mr-3"
                  style={{ backgroundColor: teams[teamName].color }}
                ></div>
              )}
              <span
                className="text-xl font-bold"
                style={{ color: teams[teamName].color }}
              >
                {teamName}
              </span>
            </div>
            <div
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${teams[teamName].color}15`,
                color: teams[teamName].color,
              }}
            >
              {teams[teamName].players.length} Players
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {teams[teamName].players.map((player) => (
              <div
                key={player.name}
                className="flex flex-col items-center w-24 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-transform hover:translate-y-[-4px]"
                style={{
                  borderTop: `4px solid ${teams[teamName].color}`,
                }}
              >
                {/* Player Image */}
                <div className="relative w-full h-24">
                  <img
                    src={player.imageUrl}
                    alt={player.name}
                    className="object-cover w-full h-full"
                  />

                  {/* Special Badges */}
                  <div className="absolute top-1 left-1 flex gap-1">
                    {player.isCaptain && (
                      <div
                        className="bg-yellow-400 p-0.5 rounded-full"
                        title="Captain"
                      >
                        <Crown className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                    {player.isViceCaptain && (
                      <div
                        className="bg-blue-400 p-0.5 rounded-full"
                        title="Vice Captain"
                      >
                        <Shield className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                  </div>

                  {player.isImpactPlayer && (
                    <div
                      className="absolute top-1 right-1 bg-purple-500 p-0.5 rounded-full"
                      title="Impact Player"
                    >
                      <Zap className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}

                  {/* Role Badge */}
                  <div
                    className="absolute bottom-1 right-1 p-1 rounded-full"
                    style={{
                      backgroundColor: getRoleColor(
                        player.role,
                        teams[teamName].color,
                        teams[teamName].secondaryColor
                      ),
                    }}
                    title={player?.role?.replace("_", " ")}
                  >
                    {getRoleIcon(player?.role)}
                  </div>
                </div>

                {/* Player Name */}
                <div className="p-2 text-center w-full">
                  <span className="text-xs font-medium line-clamp-2 text-gray-800 dark:text-gray-200">
                    {player.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function getRoleIcon(role: string) {
  switch (role) {
    case "BATTER":
      return <Activity className="h-3.5 w-3.5 text-white" />;
    case "BOWLER":
      return <Target className="h-3.5 w-3.5 text-white" />;
    case "WICKET_KEEPER":
      return <UserRound className="h-3.5 w-3.5 text-white" />;
    case "ALL_ROUNDER":
      return (
        <div className="relative">
          <Activity className="h-3.5 w-3.5 text-white" />
          <Target className="h-2 w-2 text-white absolute bottom-0 right-0" />
        </div>
      );
    default:
      return <Activity className="h-3.5 w-3.5 text-white" />;
  }
}

function getRoleColor(
  role: string,
  primaryColor: string,
  secondaryColor: string
) {
  switch (role) {
    case "BATTER":
      return primaryColor;
    case "BOWLER":
      return secondaryColor;
    case "WICKET_KEEPER":
      return "#0EA5E9"; // sky blue
    case "ALL_ROUNDER":
      return "#8B5CF6"; // violet
    default:
      return primaryColor;
  }
}
