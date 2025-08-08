
import React from 'react';

const CricketIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m13.73 13.73-3.46-3.46" />
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="m15.5 15.5 2.5 2.5" />
    <path d="M14.12 11.2 12 9.08l-2.12 2.12" />
    <path d="m11.2 14.12 2.12-2.12 2.12 2.12" />
    <path d="m5 17 3.2-3.2" />
  </svg>
);

export default CricketIcon;
