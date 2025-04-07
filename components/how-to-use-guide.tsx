"use client";

import { MessageCircleQuestionIcon } from "lucide-react";
import { useState, useEffect } from "react";

export function HowToUseGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 text-xs md:text-sm text-white bg-indigo-500 hover:bg-indigo-600 px-2 py-1 rounded-full transition-colors"
      >
        <MessageCircleQuestionIcon className="h-3 w-3 md:h-4 md:w-4" />
        <span className="hidden xs:inline">How to Use</span>
        <span className="xs:hidden">Help</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-xl max-w-2xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-xl [scrollbar-width:thin]">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-indigo-700 dark:text-indigo-400">
                  Welcome to Cream11
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 sm:h-6 sm:w-6"
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

              <div className="space-y-4 sm:space-y-6">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 sm:p-4 rounded-lg">
                  <h3 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-1 sm:mb-2 text-sm sm:text-base">
                    What is Cream11?
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                    We&apos;re your AI-powered fantasy cricket assistant. Our
                    advanced AI analyzes player performance, pitch conditions,
                    historical data, and team dynamics to suggest the optimal
                    fantasy team for each match.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-indigo-600 dark:text-indigo-300 mb-1 sm:mb-2 text-sm sm:text-base">
                    1. Smart Default Team
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                    For each match, we automatically generate the best possible
                    team based on our AI analysis. This includes optimal player
                    selection, captain choices, and credit utilization - all
                    done for you!
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-indigo-600 dark:text-indigo-300 mb-1 sm:mb-2 text-sm sm:text-base">
                    2. Customize Your Team
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                    Want to modify the AI suggestion? Simply:
                    <ul className="list-disc pl-5 mt-1">
                      <li>Click on players to remove them from your team</li>
                      <li>Select new players from the available pool</li>
                      <li>
                        Change captain/vice-captain by clicking on player badges
                      </li>
                      <li>
                        Watch your team strength metrics update in real-time
                      </li>
                    </ul>
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-indigo-600 dark:text-indigo-300 mb-1 sm:mb-2 text-sm sm:text-base">
                    3. Real-time Analysis
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                    As you modify your team, our AI instantly recalculates:
                    <ul className="list-disc pl-5 mt-1">
                      <li>Win probability</li>
                      <li>Batting strength</li>
                      <li>Bowling strength</li>
                      <li>Team balance</li>
                      <li>Strategic insights and recommendations</li>
                    </ul>
                  </p>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-3 sm:p-4 rounded-lg mt-2 sm:mt-4">
                  <p className="text-xs sm:text-sm text-indigo-700 dark:text-indigo-300">
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
