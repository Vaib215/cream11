
import React from 'react';

export const JerseyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M16.5 1.5A2.5 2.5 0 0119 4v5.03l-2.06 1.18a.5.5 0 01-.44 0L14.44 9.03V4a2.5 2.5 0 012.1-2.5zm-9 0A2.5 2.5 0 005 4v5.03l2.06 1.18a.5.5 0 00.44 0l2.06-1.18V4a2.5 2.5 0 00-2.1-2.5z" />
    <path
      fillRule="evenodd"
      d="M12 21a.75.75 0 01-.46-.14l-6-4.5A.75.75 0 015.25 15.75V11.5h13.5v4.25a.75.75 0 01-.29.58l-6 4.5a.75.75 0 01-.46.14z"
      clipRule="evenodd"
    />
  </svg>
);
