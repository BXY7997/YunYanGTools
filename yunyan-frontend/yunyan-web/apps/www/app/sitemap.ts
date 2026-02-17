import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"
import { PRODUCT_DETAILS, PRODUCT_ORDER } from "@/lib/product-catalog"

const STATIC_ROUTES = [
  "/",
  "/about",
  "/products",
  "/pricing",
  "/solutions",
  "/news",
  "/help",
  "/privacy",
  "/terms",
] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url.endsWith("/")
    ? siteConfig.url
    : `${siteConfig.url}/`
  const now = new Date()

  const entries: MetadataRoute.Sitemap = [
    ...STATIC_ROUTES.map((route) => ({
      url: new URL(route, baseUrl).toString(),
      lastModified: now,
    })),
    ...PRODUCT_ORDER.map((slug) => ({
      url: new URL(PRODUCT_DETAILS[slug].detailHref, baseUrl).toString(),
      lastModified: now,
    })),
  ]

  const dedupedEntries = new Map<string, MetadataRoute.Sitemap[number]>()

  for (const entry of entries) {
    dedupedEntries.set(entry.url, entry)
  }

  return Array.from(dedupedEntries.values())
}
