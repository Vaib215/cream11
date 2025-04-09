"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

export function HowToUseGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5"
        >
          <HelpCircle className="h-4 w-4" />
          How to Use
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>How to Use Cream 11</DialogTitle>
          <DialogDescription>
            A quick guide to understanding and using the fantasy team analysis
            tool.
          </DialogDescription>
        </DialogHeader>
        <div className="prose prose-sm dark:prose-invert max-h-[60vh] overflow-y-auto py-4 space-y-3">
          <h4>Core Idea</h4>
          <p>
            Cream 11 analyzes IPL match data and player statistics (historical
            and recent) to help you build and evaluate fantasy cricket teams.
          </p>

          <h4>Initial View</h4>
          <p>
            When you select a match, the tool automatically generates an initial
            <strong>AI-suggested optimal team</strong> based on its analysis.
            You'll see this team pre-selected in the builder, along with its
            calculated performance metrics (Win Probability, Strengths, Balance)
            and a detailed analysis.
          </p>

          <h4>Building Your Team</h4>
          <p>You can fully customize the team:</p>
          <ul>
            <li>
              <strong>Add/Remove Players:</strong> Use the player list (filtered
              by role) to add players to your 11 slots. Click on a selected
              player in your team view to remove them.
            </li>
            <li>
              <strong>Set Captain (C) & Vice-Captain (VC):</strong> Click the
              'C' and 'VC' buttons on a player's card in your team list.
              Remember, Captain gets 2x points, Vice-Captain gets 1.5x.
            </li>
            <li>
              <strong>Monitor Credits:</strong> Keep an eye on the total credits
              used. You must stay within the 100-credit limit.
            </li>
          </ul>

          <h4>Analyzing Changes</h4>
          <p>
            As you modify the team, the performance metrics (Win Probability,
            Strengths, etc.) will <strong>dynamically update</strong> based on a
            re-analysis performed by the AI using the players you've selected.
          </p>
          <p>
            The detailed text analysis section will also update to reflect the
            strengths, weaknesses, and overall outlook for your specific custom
            team.
          </p>

          <h4>Key Features</h4>
          <ul>
            <li>
              <strong>Player Stats:</strong> Click on player names (feature
              coming soon!) for detailed stats.
            </li>
            <li>
              <strong>Dynamic Analysis:</strong> Metrics and text analysis
              update automatically as you change the team.
            </li>
            <li>
              <strong>AI Comparison:</strong> The analysis compares your custom
              team to the AI's optimal suggestion.
            </li>
          </ul>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">Got it!</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
