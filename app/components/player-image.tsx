"use client";

import { useState } from "react";
import Image from "next/image";

interface PlayerImageProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export function PlayerImage({
  src,
  alt,
  size = 60,
  className = "",
}: PlayerImageProps) {
  const [error, setError] = useState(false);

  return (
    <div
      className={`relative rounded-full overflow-hidden bg-gray-200 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={error ? "/players/default-headshot.webp" : src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setError(true)}
        sizes={`${size}px`}
      />
    </div>
  );
}
