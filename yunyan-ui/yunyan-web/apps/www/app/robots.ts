import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"

export default function robots(): MetadataRoute.Robots {
  const { host } = new URL(siteConfig.url)

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/public/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host,
  }
}
