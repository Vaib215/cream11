"use client";

import { useState } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

export function HowToUseGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 text-xs md:text-sm text-white bg-indigo-500 hover:bg-indigo-600 px-2 py-1 rounded-full transition-colors"
      >
        <QuestionMarkCircleIcon className="h-4 w-4" />
        <span>How to Use</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 md:p-4">
          <div className="bg-white dark:bg-gray-800 overflow-x-hidden md:rounded-xl max-w-2xl w-full h-screen md:max-h-[90vh] overflow-y-auto shadow-xl [scrollbar-width:thin]">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
                  Welcome to Cream11
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
                    What is Cream11?
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    We're your AI-powered fantasy cricket assistant. Our
                    advanced AI analyzes player performance, pitch conditions,
                    historical data, and team dynamics to suggest the optimal
                    fantasy team for each match.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-indigo-600 dark:text-indigo-300 mb-2">
                    1. Smart Default Team
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    For each match, we automatically generate the best possible
                    team based on our AI analysis. This includes optimal player
                    selection, captain choices, and credit utilization - all
                    done for you!
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-indigo-600 dark:text-indigo-300 mb-2">
                    2. Customize Your Team
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Want to modify the AI suggestion? Simply: • Click on players
                    to remove them from your team • Select new players from the
                    available pool • Change captain/vice-captain by clicking on
                    player badges • Watch your team strength metrics update in
                    real-time
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-indigo-600 dark:text-indigo-300 mb-2">
                    3. Real-time Analysis
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    As you modify your team, our AI instantly recalculates: •
                    Win probability • Batting strength • Bowling strength • Team
                    balance • Strategic insights and recommendations
                  </p>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-4 rounded-lg mt-4">
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">
                    💡 <span className="font-semibold">Pro Tip:</span>
                    <br /> While our AI provides data-driven suggestions, feel
                    free to trust your instincts too! The best teams often
                    combine analytical insights with your cricket knowledge.
                    Good Luck!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
