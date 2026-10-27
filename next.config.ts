import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{
      source: "/:path*",
      has: [{ type: "host", value: "www.migbits.com" }],
      destination: "https://migbits.com/:path*",
      permanent: true,
    },
      { source: "/library/resource/block-coral-signup", destination: "/library/resource/template-coral-signup", permanent: true },
      { source: "/library/previews/blocks/coral-signup.html", destination: "/library/previews/templates/coral-signup.html", permanent: true },
      { source: "/library/previews/blocks/coral-signup", destination: "/library/previews/templates/coral-signup.html", permanent: true },
      { source: "/library/downloads/block-coral-signup.zip", destination: "/library/downloads/template-coral-signup.zip", permanent: true },
      { source: "/library/notices/block-coral-signup.txt", destination: "/library/notices/template-coral-signup.txt", permanent: true },
      { source: "/library/thumbnails/block-coral-signup.png", destination: "/library/thumbnails/template-coral-signup.png", permanent: true },
      { source: "/library/data/block-coral-signup.json", destination: "/library/data/template-coral-signup.json", permanent: true },
    ];
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
