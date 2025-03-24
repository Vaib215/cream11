import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "documents.iplt20.com",
      },
    ],
  },
};

export default nextConfig;
