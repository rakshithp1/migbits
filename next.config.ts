import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{
      source: "/:path*",
      has: [{ type: "host", value: "www.migbits.com" }],
      destination: "https://migbits.com/:path*",
      permanent: true,
    }];
  },
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  // Cache Components relies on timer semantics unavailable in Workers.
  // Current pages use build-time catalog data and do not need this opt-in.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
