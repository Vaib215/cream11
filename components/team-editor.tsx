"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, X, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface TeamEditorProps {
  teamName: string
  players: string[]
  teamColor: string
  secondaryColor: string
  onTeamChange: (players: string[]) => void
}

// This is a simplified list of all IPL players
// In a real app, this would come from an API
const allPlayers = [
  "Shubman Gill",
  "Jos Buttler",
  "Sai Sudharsan",
  "Mahipal Lomror",
  "Shahrukh Khan",
  "Glenn Phillips",
  "Rahul Tewatia",
  "Washington Sundar",
  "Rashid Khan",
  "Kagiso Rabada",
  "Mohammed Siraj",
  "Prabhsimran Singh",
  "Josh Inglis",
  "Shreyas Iyer",
  "Marcus Stoinis",
  "Glenn Maxwell",
  "Shashank Singh",
  "Nehal Wadhera",
  "Marco Jansen",
  "Harpreet Brar",
  "Arshdeep Singh",
  "Yuzvendra Chahal",
  "Virat Kohli",
  "Rohit Sharma",
  "MS Dhoni",
  "Jasprit Bumrah",
  "Ravindra Jadeja",
  "Hardik Pandya",
  "KL Rahul",
  "Rishabh Pant",
]

export function TeamEditor({ teamName, players, teamColor, secondaryColor, onTeamChange }: TeamEditorProps) {
  const [open, setOpen] = useState(false)
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(players)

  const handleSelect = (player: string) => {
    if (selectedPlayers.includes(player)) {
      return
    }

    if (selectedPlayers.length >= 11) {
      return
    }

    const newPlayers = [...selectedPlayers, player]
    setSelectedPlayers(newPlayers)
    onTeamChange(newPlayers)
    setOpen(false)
  }

  const handleRemove = (player: string) => {
    const newPlayers = selectedPlayers.filter((p) => p !== player)
    setSelectedPlayers(newPlayers)
    onTeamChange(newPlayers)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: teamColor }}>
          {teamName}
        </h3>
        <div className="px-3 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: teamColor }}>
          {selectedPlayers.length}/11 Players
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {selectedPlayers.map((player, index) => (
          <div
            key={player}
            className="flex items-center justify-between p-3 rounded-lg transition-all"
            style={{
              backgroundColor: `${teamColor}10`,
              borderLeft: `4px solid ${index < 6 ? teamColor : secondaryColor}`,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{player}</span>
              {index < 6 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Batter
                </span>
              )}
              {index >= 6 && index < 8 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  All-rounder
                </span>
              )}
              {index >= 8 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Bowler
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-400"
              onClick={() => handleRemove(player)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {player}</span>
            </Button>
          </div>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between border-dashed"
            disabled={selectedPlayers.length >= 11}
            style={{
              borderColor: teamColor,
              color: selectedPlayers.length >= 11 ? undefined : teamColor,
            }}
          >
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              {selectedPlayers.length >= 11 ? "Team Complete" : "Add Player"}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search player..." />
            <CommandList>
              <CommandEmpty>No player found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {allPlayers
                  .filter((player) => !selectedPlayers.includes(player))
                  .map((player) => (
                    <CommandItem key={player} value={player} onSelect={() => handleSelect(player)}>
                      <Check
                        className={cn("mr-2 h-4 w-4", selectedPlayers.includes(player) ? "opacity-100" : "opacity-0")}
                      />
                      {player}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

