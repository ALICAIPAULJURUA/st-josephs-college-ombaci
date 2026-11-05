import type { NextConfig } from "next";

import { productionSecurityHeaders, securityHeaders } from "./src/lib/headers";

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  serverExternalPackages: ["@electric-sql/pglite"],
  images: {
    qualities: [65, 75],
  },
  turbopack: {
    rules: {
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    const headers =
      process.env.NODE_ENV === "production"
        ? [...securityHeaders, ...productionSecurityHeaders]
        : securityHeaders;

    return [
      {
        source: "/:path*",
        headers,
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
