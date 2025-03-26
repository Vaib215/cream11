import type React from "react";
import { Trophy, Zap, Shield, BarChart2, CreditCard } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
interface TeamStatsProps {
  stats: {
    winProbability: number;
    battingStrength: number;
    bowlingStrength: number;
    balanceRating: number;
    totalCredits?: number;
  };
  teamAnalysis?: string; // Add optional team analysis prop from AI
}

export function TeamStats({ stats, teamAnalysis }: TeamStatsProps) {
  return (
    <div className="space-y-5">
      <div className="p-6 rounded-xl bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
        <h3 className="text-lg font-bold mb-6 text-gray-800 dark:text-gray-200 flex items-center">
          <span className="inline-block w-2 h-6 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full mr-3"></span>
          Team Performance Metrics
        </h3>

        <div className="space-y-6">
          <div className="space-y-5">
            <StatMeter
              label="Win Probability"
              value={stats.winProbability}
              icon={<Trophy className="h-5 w-5 text-amber-500" />}
              color="amber"
            />

            <StatMeter
              label="Batting Strength"
              value={stats.battingStrength}
              icon={<Zap className="h-5 w-5 text-blue-500" />}
              color="blue"
            />

            <StatMeter
              label="Bowling Strength"
              value={stats.bowlingStrength}
              icon={<Shield className="h-5 w-5 text-green-500" />}
              color="green"
            />

            <StatMeter
              label="Team Balance"
              value={stats.balanceRating}
              icon={<BarChart2 className="h-5 w-5 text-purple-500" />}
              color="purple"
            />

            {stats.totalCredits !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-indigo-500" />
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      Total Credits
                    </span>
                  </div>
                  <span
                    className={`font-bold ${
                      stats.totalCredits > 100
                        ? "text-red-500"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {stats.totalCredits}/100
                  </span>
                </div>
                <div
                  className={`h-2.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 overflow-hidden`}
                >
                  <div
                    className={`h-full rounded-full ${
                      stats.totalCredits > 100
                        ? "bg-gradient-to-r from-red-500 to-pink-500"
                        : "bg-gradient-to-r from-indigo-500 to-violet-500"
                    }`}
                    style={{
                      width: `${Math.min(stats.totalCredits, 100)}%`,
                      transition: "width 0.5s ease-in-out",
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-5 rounded-lg bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-950/30 border border-purple-100 dark:border-purple-900/50 shadow-sm">
            <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center">
              <span className="inline-block w-1.5 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full mr-2"></span>
              Team Analysis
            </h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {teamAnalysis || "Team analysis not available."}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatMeterProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "amber" | "blue" | "green" | "purple";
}

function StatMeter({ label, value, icon, color }: StatMeterProps) {
  const colorClasses = {
    amber: "bg-amber-100 dark:bg-amber-900/30",
    blue: "bg-blue-100 dark:bg-blue-900/30",
    green: "bg-green-100 dark:bg-green-900/30",
    purple: "bg-purple-100 dark:bg-purple-900/30",
  };

  const fillColorClasses = {
    amber: "bg-gradient-to-r from-amber-500 to-orange-400",
    blue: "bg-gradient-to-r from-blue-500 to-indigo-500",
    green: "bg-gradient-to-r from-green-500 to-emerald-400",
    purple: "bg-gradient-to-r from-purple-600 to-pink-500",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {label}
          </span>
        </div>
        <span className="font-bold text-gray-900 dark:text-gray-100">
          {Math.round(value)}%
        </span>
      </div>
      <div
        className={`h-2.5 rounded-full ${colorClasses[color]} overflow-hidden`}
      >
        <div
          className={`h-full rounded-full ${fillColorClasses[color]}`}
          style={{ width: `${value}%`, transition: "width 0.5s ease-in-out" }}
        ></div>
      </div>
    </div>
  );
}
