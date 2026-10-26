import type { NextConfig } from "next";

const nextConfig: NextConfig & { agentRules?: boolean } = {
  agentRules: false,
  // EC2 uses the standalone zip. Vercel builds its own Next output.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  reactStrictMode: true,
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "vis.iaai.com" },
      { protocol: "https", hostname: "images.iaai.com" },
      { protocol: "https", hostname: "*.s3.amazonaws.com" },
      { protocol: "https", hostname: "cs.copart.com" },
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
};

export default nextConfig;
