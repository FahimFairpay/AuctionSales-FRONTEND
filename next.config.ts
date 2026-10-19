import type { NextConfig } from "next";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.VITE_API_BASE ||
  "";

const nextConfig: NextConfig & { agentRules?: boolean } = {
  agentRules: false,
  // EC2 uses the standalone zip. Vercel builds its own Next output.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  reactStrictMode: true,
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  env: {
    NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION || process.env.VITE_AWS_REGION || "",
    NEXT_PUBLIC_USER_POOL_ID: process.env.NEXT_PUBLIC_USER_POOL_ID || process.env.VITE_USER_POOL_ID || "",
    NEXT_PUBLIC_USER_POOL_CLIENT_ID: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || process.env.VITE_USER_POOL_CLIENT_ID || "",
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || process.env.VITE_API_BASE || "",
    VITE_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION || process.env.VITE_AWS_REGION || "",
    VITE_USER_POOL_ID: process.env.NEXT_PUBLIC_USER_POOL_ID || process.env.VITE_USER_POOL_ID || "",
    VITE_USER_POOL_CLIENT_ID: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || process.env.VITE_USER_POOL_CLIENT_ID || "",
    VITE_API_BASE: process.env.NEXT_PUBLIC_API_BASE || process.env.VITE_API_BASE || "",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "vis.iaai.com" },
      { protocol: "https", hostname: "images.iaai.com" },
      { protocol: "https", hostname: "*.s3.amazonaws.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      { source: "/app/watchlists", destination: "/app/presets", permanent: true },
      { source: "/app/watchlists/new", destination: "/app/presets/new", permanent: true },
      { source: "/app/watchlists/:watchlistId", destination: "/app/presets/:watchlistId", permanent: true },
      { source: "/app/watchlists/:watchlistId/edit", destination: "/app/presets/:watchlistId/edit", permanent: true },
      { source: "/app/activity", destination: "/app/history", permanent: true },
      { source: "/app/activity-logs", destination: "/app/history", permanent: true },
      { source: "/app/requests", destination: "/app/presets", permanent: true },
      { source: "/app/requests/new", destination: "/app/presets/new", permanent: true },
      { source: "/app/requests/:requestId", destination: "/app/presets/:requestId", permanent: true },
      { source: "/admin/watchlists", destination: "/admin/presets", permanent: true },
      { source: "/admin/requests", destination: "/admin/presets", permanent: true },
      { source: "/admin/crawler", destination: "/admin/schedules", permanent: true },
      { source: "/admin/crawler/:scrapeRunId", destination: "/admin/schedules/:scrapeRunId", permanent: true },
      { source: "/admin/scrape-runs", destination: "/admin/schedules", permanent: true },
      { source: "/admin/scrape-runs/:scrapeRunId", destination: "/admin/schedules/:scrapeRunId", permanent: true },
      { source: "/admin/scrape-recipe", destination: "/admin/settings", permanent: true },
    ];
  },
  async rewrites() {
    if (!apiBase) return [];
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
