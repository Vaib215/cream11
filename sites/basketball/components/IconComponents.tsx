
import React from 'react';

// Define a common type for icon components that might need a tooltip title
interface TitledIconProps {
  className?: string;
  title?: string;
}

export const BasketballIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm11 0c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM12 4c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 11.5c-2.33 0-4.32 1.45-5.12 3.5h10.24c-.8-2.05-2.79-3.5-5.12-3.5z" />
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-3.5-3.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm7 0c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM12 9c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" />
    <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm5.1,15.35a7.43,7.43,0,0,1-10.2,0,8,8,0,0,1,10.2,0ZM6.5,13a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,6.5,13Zm11,0a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,17.5,13ZM12,9a3,3,0,1,1,3-3A3,3,0,0,1,12,9Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3.06,14.5a10,10,0,0,0,17.88,0" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const PositionIcon = ({ position }: { position: string }) => {
  const commonClasses = "font-black text-center text-sm rounded-full w-8 h-8 flex items-center justify-center border-2";
  const positionStyles: { [key: string]: string } = {
    PG: "bg-blue-200 text-blue-800 border-blue-400",
    SG: "bg-green-200 text-green-800 border-green-400",
    SF: "bg-yellow-200 text-yellow-800 border-yellow-400",
    PF: "bg-red-200 text-red-800 border-red-400",
    C: "bg-purple-200 text-purple-800 border-purple-400",
  };
  return (
    <div className={`${commonClasses} ${positionStyles[position] || 'bg-gray-200 text-gray-800 border-gray-400'}`}>
      {position}
    </div>
  );
};

export const StarIcon = ({ className, title }: TitledIconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        {title && <title>{title}</title>}
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
);

export const ShieldIcon = ({ className, title }: TitledIconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"/>
    </svg>
);
