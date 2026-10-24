import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: "/\u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u0438/\u0441\u043E\u0432\u043C\u0435\u0441\u0442\u0438\u043C\u043E\u0441\u0442\u044C-\u043F\u0430\u0440",
        destination: "/compat/couple",
      },
    ];
  },
};

export default nextConfig;