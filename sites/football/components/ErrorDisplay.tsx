import React from 'react';

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
  retryText?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry, retryText }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] sm:min-h-[400px] text-center bg-red-900/20 border border-red-500/50 rounded-lg p-4 sm:p-6 md:p-8">
      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center bg-red-500/20 rounded-full mb-3 sm:mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-red-400">An Error Occurred</h2>
      <p className="text-gray-300 text-sm sm:text-base mt-2 max-w-lg">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 sm:mt-6 bg-emerald-600 text-white font-bold py-2 px-4 sm:px-6 rounded-lg transition-colors hover:bg-emerald-500 text-sm sm:text-base"
      >
        {retryText || 'Return to Fixtures'}
      </button>
    </div>
  );
};

export default ErrorDisplay;
