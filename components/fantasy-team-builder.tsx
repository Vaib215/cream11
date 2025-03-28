"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronsUpDown,
  X,
  Activity,
  Target,
  UserRound,
  Plus,
  Shield,
  Crown,
  Zap,
  Coins,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Player } from "@/types/player";
import { PlayerImage } from "@/app/components/player-image";

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
  // const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);
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

  const handleCaptainSelection = (playerName: string) => {
    const newTeam = fantasyTeam.map((player) => ({
      ...player,
      isCaptain: player.name === playerName,
      // If this player is becoming captain and was vice-captain, remove vice-captain status
      isViceCaptain: player.name === playerName ? false : player.isViceCaptain,
    }));
    onFantasyTeamChange(newTeam);
  };

  const handleViceCaptainSelection = (playerName: string) => {
    const newTeam = fantasyTeam.map((player) => ({
      ...player,
      // If this player is becoming vice-captain and was captain, remove captain status
      isCaptain: player.name === playerName ? false : player.isCaptain,
      isViceCaptain: player.name === playerName,
    }));
    onFantasyTeamChange(newTeam);
  };

  const handleDragStart = (
    e: React.DragEvent,
    player: Player,
    fromFantasyTeam: boolean = false
  ) => {
    // setDraggedPlayer(player);
    e.dataTransfer.setData(
      "player",
      JSON.stringify({ ...player, fromFantasyTeam })
    );

    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add("opacity-50");
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // setDraggedPlayer(null);

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
    <div className="space-y-4 sm:space-y-6">
      {/* Fantasy Team Section */}
      <div
        className="p-3 sm:p-4 md:p-5 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 shadow-sm"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, "fantasy")}
        ref={containerRef}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
            <h4 className="font-bold text-sm sm:text-base text-gray-800 dark:text-gray-200">
              Your Fantasy Team
            </h4>
          </div>
          <div className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {fantasyTeam.length}/11 Players
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Batters Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Batters ({batters.length})</span>
            </div>
            <div className="space-y-2">
              {batters.map((player) => (
                <EnhancedPlayerCard
                  key={player.name}
                  player={player}
                  onRemove={() => handleRemove(player.name)}
                  onDragStart={(e) => handleDragStart(e, player, true)}
                  onDragEnd={handleDragEnd}
                  onCaptainSelect={handleCaptainSelection}
                  onViceCaptainSelect={handleViceCaptainSelection}
                />
              ))}
            </div>
          </div>

          {/* Bowlers Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <Target className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Bowlers ({bowlers.length})</span>
            </div>
            <div className="space-y-2">
              {bowlers.map((player) => (
                <EnhancedPlayerCard
                  key={player.name}
                  player={player}
                  onRemove={() => handleRemove(player.name)}
                  onDragStart={(e) => handleDragStart(e, player, true)}
                  onDragEnd={handleDragEnd}
                  onCaptainSelect={handleCaptainSelection}
                  onViceCaptainSelect={handleViceCaptainSelection}
                />
              ))}
            </div>
          </div>

          {/* All Rounders Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>All Rounders ({allRounders.length})</span>
            </div>
            <div className="space-y-2">
              {allRounders.map((player) => (
                <EnhancedPlayerCard
                  key={player.name}
                  player={player}
                  onRemove={() => handleRemove(player.name)}
                  onDragStart={(e) => handleDragStart(e, player, true)}
                  onDragEnd={handleDragEnd}
                  onCaptainSelect={handleCaptainSelection}
                  onViceCaptainSelect={handleViceCaptainSelection}
                />
              ))}
            </div>
          </div>

          {/* Wicket Keepers Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <UserRound className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Wicket Keepers ({wicketKeepers.length})</span>
            </div>
            <div className="space-y-2">
              {wicketKeepers.map((player) => (
                <EnhancedPlayerCard
                  key={player.name}
                  player={player}
                  onRemove={() => handleRemove(player.name)}
                  onDragStart={(e) => handleDragStart(e, player, true)}
                  onDragEnd={handleDragEnd}
                  onCaptainSelect={handleCaptainSelection}
                  onViceCaptainSelect={handleViceCaptainSelection}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between text-xs sm:text-sm"
              >
                Add Player
                <ChevronsUpDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command className="border border-purple-100 dark:border-purple-900">
                <CommandInput
                  placeholder="Search player..."
                  className="border-purple-100 dark:border-purple-900 text-sm"
                />
                <CommandList>
                  <CommandEmpty>No player found.</CommandEmpty>
                  <CommandGroup className="max-h-48 sm:max-h-64 overflow-auto">
                    {availablePlayers.map((player) => (
                      <CommandItem
                        key={player.name}
                        value={player.name}
                        onSelect={() => handleSelect(player)}
                        className="text-xs sm:text-sm"
                      >
                        <div
                          className="h-2 w-2 sm:h-3 sm:w-3 rounded-full mr-2"
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
        className="p-3 sm:p-4 md:p-5 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 shadow-sm"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, "available")}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
            <h4 className="font-bold text-sm sm:text-base text-gray-800 dark:text-gray-200">
              Available Players
            </h4>
          </div>
          <div className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {availablePlayers.length} Players
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
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
              className="flex items-center justify-center p-2 sm:p-3 rounded-lg text-xs font-medium text-center text-gray-500 bg-gray-50 dark:bg-gray-700/30 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50"
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
  onCaptainSelect?: (playerName: string) => void;
  onViceCaptainSelect?: (playerName: string) => void;
}

function EnhancedPlayerCard({
  player,
  onRemove,
  onDragStart,
  onDragEnd,
  onClick,
  isAvailable = false,
  onCaptainSelect,
  onViceCaptainSelect,
}: EnhancedPlayerCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`relative group flex items-center p-2 sm:p-3 rounded-lg border ${
        isAvailable
          ? "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
          : "border-gray-200 dark:border-gray-700"
      } bg-white dark:bg-gray-800 shadow-sm transition-all duration-200 ${
        onClick ? "cursor-pointer" : ""
      } ${isAvailable ? "hover:shadow-md" : ""}`}
    >
      {/* Player Image */}
      <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
        <PlayerImage
          src={player.imageUrl || "/players/default-headshot.webp"}
          alt={player.name}
          size={isAvailable ? 30 : 40}
        />
        {player.isCaptain && (
          <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
            <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-800" />
          </div>
        )}
        {player.isViceCaptain && (
          <div className="absolute -top-1 -right-1 bg-gray-400 rounded-full p-0.5">
            <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-800" />
          </div>
        )}
      </div>

      {/* Player Info */}
      <div className="ml-3 flex-grow min-w-0">
        <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {player.name}
        </h3>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
            {player.team}
          </p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-[10px] sm:text-xs font-medium text-amber-600 dark:text-amber-400 cursor-help">
                  <Coins className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                  {player.credits}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Player credit value - You have 100 total credits to build your
                  team
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Captain and Vice-Captain buttons - Only show for fantasy team players */}
      {!isAvailable && onCaptainSelect && onViceCaptainSelect && (
        <div className="absolute -bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCaptainSelect(player.name);
                  }}
                  className={`flex items-center justify-center h-5 w-5 rounded-full ${
                    player.isCaptain
                      ? "bg-yellow-400 text-yellow-800"
                      : "bg-gray-100 hover:bg-yellow-100 text-gray-600 hover:text-yellow-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-yellow-400"
                  }`}
                >
                  <span className="text-[8px] font-bold">C</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {player.isCaptain
                    ? "Captain (2x points)"
                    : "Make Captain (2x points)"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViceCaptainSelect(player.name);
                  }}
                  className={`flex items-center justify-center h-5 w-5 rounded-full ${
                    player.isViceCaptain
                      ? "bg-gray-400 text-gray-800"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  <span className="text-[8px] font-bold">VC</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {player.isViceCaptain
                    ? "Vice-Captain (1.5x points)"
                    : "Make Vice-Captain (1.5x points)"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Remove Button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-1.5 -right-1.5 hidden group-hover:flex items-center justify-center h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-900"
        >
          <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-600 dark:text-red-400" />
        </button>
      )}
    </div>
  );
}
