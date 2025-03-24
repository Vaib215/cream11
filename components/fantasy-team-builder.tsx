"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronsUpDown,
  X,
  UserPlus,
  Activity,
  Target,
  UserRound,
  Plus,
  Shield,
  Crown,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import { Player } from "@/types/player";

interface FantasyTeamBuilderProps {
  allPlayers: Player[];
  fantasyTeam: Player[];
  onFantasyTeamChange: (team: Player[]) => void;
}

export function FantasyTeamBuilder({
  allPlayers,
  fantasyTeam,
  onFantasyTeamChange,
}: FantasyTeamBuilderProps) {
  const [open, setOpen] = useState(false);
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Filter out players who are already in fantasy team
    setAvailablePlayers(
      allPlayers.filter(
        (player) => !fantasyTeam.some((p) => p.name === player.name)
      )
    );
  }, [allPlayers, fantasyTeam]);

  const handleSelect = (player: Player) => {
    if (fantasyTeam.some((p) => p.name === player.name)) {
      return;
    }

    if (fantasyTeam.length >= 11) {
      return;
    }

    const newTeam = [...fantasyTeam, player];
    onFantasyTeamChange(newTeam);
    setOpen(false);
  };

  const handleRemove = (playerName: string) => {
    const newTeam = fantasyTeam.filter((p) => p.name !== playerName);
    onFantasyTeamChange(newTeam);
  };

  const handleDragStart = (
    e: React.DragEvent,
    player: Player,
    fromFantasyTeam: boolean = false
  ) => {
    setDraggedPlayer(player);
    e.dataTransfer.setData(
      "player",
      JSON.stringify({ ...player, fromFantasyTeam })
    );

    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add("opacity-50");
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedPlayer(null);

    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove("opacity-50");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (
    e: React.DragEvent,
    dropArea: "fantasy" | "available"
  ) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("player");

    if (!data) return;

    const player = JSON.parse(data) as Player & { fromFantasyTeam: boolean };

    if (dropArea === "fantasy" && !player.fromFantasyTeam) {
      // Add to fantasy team if not already in and we have room
      if (
        !fantasyTeam.some((p) => p.name === player.name) &&
        fantasyTeam.length < 11
      ) {
        onFantasyTeamChange([...fantasyTeam, player]);
      }
    } else if (dropArea === "available" && player.fromFantasyTeam) {
      // Remove from fantasy team
      handleRemove(player.name);
    }
  };

  // Group players by role for the fantasy team display
  const groupPlayersByRole = () => {
    const batters = fantasyTeam.filter((p) => p.role === "BATTER");
    const bowlers = fantasyTeam.filter((p) => p.role === "BOWLER");
    const allRounders = fantasyTeam.filter((p) => p.role === "ALL_ROUNDER");
    const wicketKeepers = fantasyTeam.filter((p) => p.role === "WICKET_KEEPER");

    // If no role is specified for legacy data, use the old grouping
    if (fantasyTeam.some((p) => !p.role)) {
      return {
        batters: fantasyTeam.slice(0, 5),
        allRounders: fantasyTeam.slice(5, 7),
        bowlers: fantasyTeam.slice(7),
        wicketKeepers: [],
      };
    }

    return { batters, bowlers, allRounders, wicketKeepers };
  };

  const { batters, bowlers, allRounders, wicketKeepers } = groupPlayersByRole();

  return (
    <div className="space-y-6" ref={containerRef}>
      <div
        className="p-5 rounded-xl bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/10 border border-purple-100 dark:border-purple-900/30 shadow-sm"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, "fantasy")}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h4 className="font-bold text-gray-800 dark:text-gray-200">
              Your Cream 11 Squad
            </h4>
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
            {fantasyTeam.length}/11 Players
          </div>
        </div>

        <div className="space-y-5">
          {/* Wicket Keepers */}
          {wicketKeepers.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-semibold flex items-center text-gray-700 dark:text-gray-300">
                <span className="inline-block w-1.5 h-4 bg-gradient-to-b from-sky-500 to-cyan-600 rounded-full mr-2"></span>
                Wicket Keepers
              </h5>
              <div className="flex flex-wrap gap-2">
                {wicketKeepers.map((player) => (
                  <EnhancedPlayerCard
                    key={player.name}
                    player={player}
                    onRemove={() => handleRemove(player.name)}
                    onDragStart={(e) => handleDragStart(e, player, true)}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Batters */}
          <div className="space-y-2">
            <h5 className="text-sm font-semibold flex items-center text-gray-700 dark:text-gray-300">
              <span className="inline-block w-1.5 h-4 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-2"></span>
              Batters
            </h5>
            <div className="flex flex-wrap gap-2">
              {batters.map((player) => (
                <EnhancedPlayerCard
                  key={player.name}
                  player={player}
                  onRemove={() => handleRemove(player.name)}
                  onDragStart={(e) => handleDragStart(e, player, true)}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          </div>

          {/* All-rounders */}
          <div className="space-y-2">
            <h5 className="text-sm font-semibold flex items-center text-gray-700 dark:text-gray-300">
              <span className="inline-block w-1.5 h-4 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full mr-2"></span>
              All-rounders
            </h5>
            <div className="flex flex-wrap gap-2">
              {allRounders.map((player) => (
                <EnhancedPlayerCard
                  key={player.name}
                  player={player}
                  onRemove={() => handleRemove(player.name)}
                  onDragStart={(e) => handleDragStart(e, player, true)}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          </div>

          {/* Bowlers */}
          <div className="space-y-2">
            <h5 className="text-sm font-semibold flex items-center text-gray-700 dark:text-gray-300">
              <span className="inline-block w-1.5 h-4 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full mr-2"></span>
              Bowlers
            </h5>
            <div className="flex flex-wrap gap-2">
              {bowlers.map((player) => (
                <EnhancedPlayerCard
                  key={player.name}
                  player={player}
                  onRemove={() => handleRemove(player.name)}
                  onDragStart={(e) => handleDragStart(e, player, true)}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Add Player Button */}
        <div className="mt-5">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between border-dashed border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 bg-white dark:bg-gray-800"
                disabled={fantasyTeam.length >= 11}
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  {fantasyTeam.length >= 11 ? "Team Complete" : "Add Player"}
                </div>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command className="border border-purple-100 dark:border-purple-900">
                <CommandInput
                  placeholder="Search player..."
                  className="border-purple-100 dark:border-purple-900"
                />
                <CommandList>
                  <CommandEmpty>No player found.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {availablePlayers.map((player) => (
                      <CommandItem
                        key={player.name}
                        value={player.name}
                        onSelect={() => handleSelect(player)}
                      >
                        <div
                          className="h-3 w-3 rounded-full mr-2"
                          style={{ backgroundColor: player.teamColor }}
                        ></div>
                        <span className="font-medium">{player.name}</span>
                        <span className="ml-auto text-xs text-gray-500">
                          {player.team}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Available Players Section */}
      <div
        className="p-5 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 shadow-sm"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, "available")}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h4 className="font-bold text-gray-800 dark:text-gray-200">
              Available Players
            </h4>
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {availablePlayers.length} Players
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {availablePlayers.slice(0, 12).map((player) => (
            <EnhancedPlayerCard
              key={player.name}
              player={player}
              isAvailable={true}
              onDragStart={(e) => handleDragStart(e, player)}
              onDragEnd={handleDragEnd}
              onClick={() => handleSelect(player)}
            />
          ))}
          {availablePlayers.length > 12 && (
            <div
              className="flex items-center justify-center p-3 rounded-lg w-[140px] h-[90px] text-xs font-medium text-center text-gray-500 bg-gray-50 dark:bg-gray-700/30 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50"
              onClick={() => setOpen(true)}
            >
              +{availablePlayers.length - 12} more players
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface EnhancedPlayerCardProps {
  player: Player;
  onRemove?: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onClick?: () => void;
  isAvailable?: boolean;
}

function EnhancedPlayerCard({
  player,
  onRemove,
  onDragStart,
  onDragEnd,
  onClick,
  isAvailable = false,
}: EnhancedPlayerCardProps) {
  const defaultImage =
    "https://www.cricbuzz.com/a/img/v1/152x152/i1/c170624/profile-placeholder.jpg";

  return (
    <div
      className={`flex flex-col relative w-[140px] h-[90px] cursor-grab rounded-lg overflow-hidden transition-all ${
        isAvailable ? "bg-white dark:bg-gray-800" : "bg-white dark:bg-gray-800"
      }`}
      style={{
        borderLeft: `3px solid ${player.teamColor}`,
      }}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
    >
      <div className="flex h-full p-2">
        {/* Player Image */}
        <div className="relative h-full aspect-square mr-2 rounded-md overflow-hidden">
          <img
            src={player.imageUrl || defaultImage}
            alt={player.name}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Player Details */}
        <div className="flex-1 flex flex-col">
          <span className="font-medium text-sm line-clamp-2 text-gray-800 dark:text-gray-200">
            {player.name}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-auto">
            {player.team}
          </span>
        </div>
      </div>

      {/* Role Icon */}
      {player.role && (
        <div
          className="absolute top-1 right-1 rounded-full p-1"
          style={{
            backgroundColor: getRoleColor(player.role),
          }}
        >
          {getRoleIcon(player.role)}
        </div>
      )}

      {/* Special Status Icons */}
      <div className="absolute bottom-1 right-1 flex gap-1">
        {player.isCaptain && (
          <div className="bg-yellow-400 p-0.5 rounded-full" title="Captain">
            <Crown className="h-3 w-3 text-white" />
          </div>
        )}
        {player.isViceCaptain && (
          <div className="bg-blue-400 p-0.5 rounded-full" title="Vice Captain">
            <Shield className="h-3 w-3 text-white" />
          </div>
        )}
        {player.isImpactPlayer && (
          <div
            className="bg-purple-500 p-0.5 rounded-full"
            title="Impact Player"
          >
            <Zap className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      {/* Remove Button (only show for fantasy team) */}
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-0 left-0 h-6 w-6 p-0 rounded-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Remove</span>
        </Button>
      )}
    </div>
  );
}

function getRoleIcon(role: string) {
  switch (role) {
    case "BATTER":
      return <Activity className="h-3 w-3 text-white" />;
    case "BOWLER":
      return <Target className="h-3 w-3 text-white" />;
    case "WICKET_KEEPER":
      return <UserRound className="h-3 w-3 text-white" />;
    case "ALL_ROUNDER":
      return (
        <div className="relative">
          <Activity className="h-3 w-3 text-white" />
          <Target className="h-1.5 w-1.5 text-white absolute bottom-0 right-0" />
        </div>
      );
    default:
      return <Activity className="h-3 w-3 text-white" />;
  }
}

function getRoleColor(role: string) {
  switch (role) {
    case "BATTER":
      return "#4F46E5"; // indigo
    case "BOWLER":
      return "#10B981"; // emerald
    case "WICKET_KEEPER":
      return "#0EA5E9"; // sky blue
    case "ALL_ROUNDER":
      return "#8B5CF6"; // violet
    default:
      return "#4F46E5"; // indigo
  }
}
