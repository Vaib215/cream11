"use client";

import { useMemo } from "react";
import { Trophy, TrendingUp, Target, Scale, BarChart3 } from "lucide-react";

interface TeamPerformanceMetricsProps {
  winProbability: number;
  battingStrength: number;
  bowlingStrength: number;
  balanceRating: number;
}

export function TeamPerformanceMetrics({
  winProbability,
  battingStrength,
  bowlingStrength,
  balanceRating,
}: TeamPerformanceMetricsProps) {
  const metrics = useMemo(
    () => [
      {
        name: "Win Probability",
        value: winProbability,
        icon: Trophy,
        color: "from-yellow-400 to-amber-500",
        textColor: "text-amber-600 dark:text-amber-400",
        description:
          "Likelihood of this team winning based on player stats and matchups",
      },
      {
        name: "Batting Strength",
        value: battingStrength,
        icon: TrendingUp,
        color: "from-blue-400 to-indigo-500",
        textColor: "text-indigo-600 dark:text-indigo-400",
        description:
          "Team's batting power based on selected batters and all-rounders",
      },
      {
        name: "Bowling Strength",
        value: bowlingStrength,
        icon: Target,
        color: "from-green-400 to-emerald-500",
        textColor: "text-emerald-600 dark:text-emerald-400",
        description:
          "Team's bowling effectiveness based on selected bowlers and all-rounders",
      },
      {
        name: "Team Balance",
        value: balanceRating,
        icon: Scale,
        color: "from-purple-400 to-violet-500",
        textColor: "text-violet-600 dark:text-violet-400",
        description:
          "Balance between batting, bowling, and all-round capabilities",
      },
    ],
    [winProbability, battingStrength, bowlingStrength, balanceRating]
  );

  const getPerformanceGrade = (value: number) => {
    if (value >= 90) return { grade: "A+", color: "text-emerald-500" };
    if (value >= 80) return { grade: "A", color: "text-emerald-500" };
    if (value >= 70) return { grade: "B+", color: "text-blue-500" };
    if (value >= 60) return { grade: "B", color: "text-blue-500" };
    if (value >= 50) return { grade: "C+", color: "text-amber-500" };
    if (value >= 40) return { grade: "C", color: "text-amber-500" };
    if (value >= 30) return { grade: "D+", color: "text-orange-500" };
    if (value >= 20) return { grade: "D", color: "text-orange-500" };
    return { grade: "F", color: "text-red-500" };
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center mb-4">
        <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
        <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
          Team Performance Metrics
        </h4>
      </div>

      <div className="space-y-3 md:space-y-4">
        {metrics.map((metric) => {
          const { grade, color } = getPerformanceGrade(metric.value);

          return (
            <div key={metric.name} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center">
                  <metric.icon className={`h-4 w-4 ${metric.textColor} mr-2`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-bold ${color}`}>{grade}</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {metric.value}%
                  </span>
                </div>
              </div>

              <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${metric.color} transition-all duration-500 ease-out`}
                  style={{ width: `${metric.value}%` }}
                />
              </div>

              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {metric.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
