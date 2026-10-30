import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

import {
  productionSecurityHeaders,
  securityHeaders,
} from "./src/lib/headers";

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
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

export default withPayload(nextConfig, { devBundleServerPackages: false });
