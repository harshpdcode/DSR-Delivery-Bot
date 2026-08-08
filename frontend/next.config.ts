import path from "path";
import type { NextConfig } from "next";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const backendHost = rawApiUrl.replace(/\/api\/v1\/?$/, "").replace(/\/api\/?$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendHost}/api/:path*`,
      },
      {
        source: "/ws/:path*",
        destination: `${backendHost}/ws/:path*`,
      },
    ];
  },
};

export default nextConfig;
