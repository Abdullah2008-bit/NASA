import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  webpack: (config) => {
    // Ensure @ always points to frontend/src regardless of where build is invoked
    const srcPath = path.join(process.cwd(), "src");
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": srcPath,
    };
    return config;
  },
};

export default nextConfig;
