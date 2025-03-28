import playerData from "@/data/ipl_2024_player_data.json";
import { PlayerDetails, SelectedPlayer } from "@/types/player";

export const getHistoricalData = (players: Record<string, PlayerDetails[]>) => {
  const allPlayers = Object.entries(players).map(([player, data]) => ({
    ...data,
    player,
  }));

  const historicalData = allPlayers.map((player) => {
    return playerData[player.player as keyof typeof playerData];
  });

  return historicalData;
};
