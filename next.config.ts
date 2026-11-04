import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pages serves project repositories under /<repository-name>/.
  basePath: process.env.PAGES_BASE_PATH || "",
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
