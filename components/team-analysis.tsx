"use client";

import { Loader2, AlertCircle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ReactMarkdown from "react-markdown";

interface TeamAnalysisProps {
  analysis: string;
  isLoading?: boolean;
}

export function TeamAnalysis({
  analysis,
  isLoading = false,
}: TeamAnalysisProps) {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
          Team Analysis
        </h4>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">
                AI-generated analysis of your fantasy team&apos;s strengths and
                weaknesses
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <span className="ml-3 text-sm text-gray-500">
            Analyzing your team...
          </span>
        </div>
      ) : analysis ? (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
            <ReactMarkdown
              components={{
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                p: ({ children }) => <p className="mb-4">{children}</p>,
              }}
            >
              {analysis}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-8 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
          <AlertCircle className="h-5 w-5 text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">
            Select 11 players to see team analysis
          </span>
        </div>
      )}
    </div>
  );
}
