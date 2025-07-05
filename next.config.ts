import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "documents.iplt20.com",
      },
      {
        protocol: "https",
        hostname: "g.cricapi.com"
      },
      {
        protocol: "https",
        hostname: "h.cricapi.com"
      },
      {
        protocol: "https",
        hostname: "images.sportdevs.com"
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://eu.i.posthog.com/decide",
      },
      {
        destination: "https://g.cricapi.com",
        source: "/api/cricket/:path*",
      }
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
