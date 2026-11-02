import type { MetadataRoute } from "next";

import { siteOrigin } from "@/components/seo/JsonLd";

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/apply", "/design"],
    },
    sitemap: new URL("/sitemap.xml", `${origin}/`).toString(),
  };
}
