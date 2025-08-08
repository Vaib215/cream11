
import React from 'react';

const Loader = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 text-white/80">
      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold tracking-wide">{message}</p>
      <p className="text-sm text-white/60">This may take a few moments...</p>
    </div>
  );
};

export default Loader;
