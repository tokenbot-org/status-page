import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dynamic rendering for API routes
  images: {
    unoptimized: false,
  },
};

export default nextConfig;
