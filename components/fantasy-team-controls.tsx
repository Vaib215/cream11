"use client";

import { RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FantasyTeamControlsProps {
  totalCredits: number;
  loading: boolean;
  onUseAITeam: () => void;
  onResetTeam: () => void;
}

export function FantasyTeamControls({
  totalCredits,
  loading,
  onUseAITeam,
  onResetTeam,
}: FantasyTeamControlsProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          <span className="inline-block w-8 h-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded mr-3"></span>
          Your Cream 11 Fantasy Team
        </h3>
        <div className="mt-2 flex items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
            Total Credits:
          </span>
          <span
            className={`font-bold text-sm ${
              totalCredits > 100 ? "text-red-500" : "text-green-500"
            }`}
          >
            {totalCredits}/100
          </span>
          {totalCredits > 100 && (
            <span className="ml-2 text-xs text-red-500">
              (Exceeded credit limit)
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onUseAITeam}
          variant="outline"
          size="sm"
          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600"
          disabled={loading}
        >
          <Zap className="h-4 w-4" />
          {loading ? "Loading..." : "Use AI Team"}
        </Button>
        <Button
          onClick={onResetTeam}
          variant="outline"
          size="sm"
          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600"
        >
          <RefreshCw className="h-4 w-4" />
          Reset Team
        </Button>
      </div>
    </div>
  );
}
