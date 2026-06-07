import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    // Allows production builds to complete even with lint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allows production builds to complete even with type mismatches
    ignoreBuildErrors: true,
  }
};

export default nextConfig;