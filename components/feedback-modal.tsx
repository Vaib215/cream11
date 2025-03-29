"use client";

import { useState, useRef, useEffect } from "react";
import { usePostHog } from "posthog-js/react";
import { MessagesSquareIcon, X, CheckCircle, SendIcon } from "lucide-react";

export function FeedbackModal() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const posthog = usePostHog();

  // Focus the textarea when expanded
  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 300);
    }
  }, [isExpanded]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        isExpanded
      ) {
        handleClose();
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  const handleFeedbackSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const feedback = formData.get("feedback") as string;

    try {
      posthog.capture("survey sent", {
        $survey_id: "0195e3ad-cebd-0000-138d-e403f7b7e545",
        $survey_response: feedback,
      });

      // Simulate a small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 500));

      setIsSubmitted(true);
      // Reset after showing success
      setTimeout(() => {
        setIsExpanded(false);
        // Reset states after collapse
        setTimeout(() => {
          setIsSubmitted(false);
          setIsSubmitting(false);
        }, 500);
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
    // Reset states after collapse
    setTimeout(() => {
      setIsSubmitted(false);
      setIsSubmitting(false);
    }, 500);
  };

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isExpanded]);

  return (
    <div
      className={`fixed ${
        isExpanded
          ? "inset-0 md:inset-auto md:bottom-4 md:right-4 z-50 flex items-end md:items-start justify-center md:justify-end p-4"
          : "bottom-2 right-2 md:bottom-4 md:right-4 z-30"
      }`}
    >
      <div
        ref={containerRef}
        style={{
          transformOrigin: "bottom right",
          boxShadow: isExpanded
            ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
            : "",
          transition:
            "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease",
        }}
        className={`overflow-hidden rounded-xl transition-colors duration-300 ${
          isExpanded
            ? "bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900 w-full max-w-sm md:w-96 opacity-100 transform-none"
            : "bg-indigo-600 hover:bg-indigo-700 rounded-full w-auto opacity-100 transform-none"
        }`}
      >
        {isExpanded ? (
          <div className="p-5 relative">
            {/* Close button */}
            <button
              onClick={handleClose}
              aria-label="Close feedback form"
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full p-1.5 hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={18} />
            </button>

            {isSubmitted ? (
              <div className="py-8 flex flex-col items-center justify-center animate-fadeInUp">
                <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/50 p-2.5 mb-4">
                  <CheckCircle
                    size={32}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Thank you!
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                  We appreciate your feedback
                </p>
              </div>
            ) : (
              <div className="animate-fadeInUp">
                <h2 className="text-lg font-bold text-gray-900 leading-tight dark:text-white mb-4 pr-6">
                  Share your feedback with us!
                </h2>

                <form onSubmit={handleFeedbackSubmit}>
                  <textarea
                    ref={textareaRef}
                    name="feedback"
                    placeholder="Start typing..."
                    required
                    disabled={isSubmitting}
                    className="w-full h-28 md:h-32 p-3 border border-indigo-100 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-70 text-sm"
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-sm flex items-center justify-center shadow-sm"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      <>
                        Submit <SendIcon size={14} className="ml-2" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <button
            name="feedback-button"
            onClick={() => setIsExpanded(true)}
            className="text-white font-medium py-2.5 px-4 rounded-full shadow-md transition-all duration-300 hover:shadow-lg flex items-center justify-center whitespace-nowrap"
          >
            <MessagesSquareIcon className="mr-2 w-4 h-4" />
            <span>Give Feedback</span>
          </button>
        )}
      </div>
    </div>
  );
}
