import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"
import { PRODUCT_DETAILS, PRODUCT_ORDER } from "@/lib/product-catalog"
import { blogSource, showcaseSource, source } from "@/lib/source"

const STATIC_ROUTES = [
  "/",
  "/about",
  "/products",
  "/pricing",
  "/solutions",
  "/news",
  "/help",
  "/showcase",
  "/privacy",
  "/terms",
  "/blog",
  "/docs",
] as const

function normalizeDate(value: unknown) {
  if (!value) {
    return new Date()
  }

  const parsedDate = new Date(value as string | number | Date)
  if (Number.isNaN(parsedDate.getTime())) {
    return new Date()
  }

  return parsedDate
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url.endsWith("/")
    ? siteConfig.url
    : `${siteConfig.url}/`
  const now = new Date()
  const allDocs = source.getPages()
  const allBlogs = blogSource.getPages()
  const allShowcases = showcaseSource.getPages()

  const entries: MetadataRoute.Sitemap = [
    ...STATIC_ROUTES.map((route) => ({
      url: new URL(route, baseUrl).toString(),
      lastModified: now,
    })),
    ...PRODUCT_ORDER.map((slug) => ({
      url: new URL(PRODUCT_DETAILS[slug].detailHref, baseUrl).toString(),
      lastModified: now,
    })),
    ...allDocs.map((post) => ({
      url: new URL(post.url, baseUrl).toString(),
      lastModified: normalizeDate(post.data.lastModified ?? post.data.date),
    })),
    ...allBlogs.map((post) => ({
      url: new URL(post.url, baseUrl).toString(),
      lastModified: normalizeDate(post.data.publishedOn),
    })),
    ...allShowcases.map((post) => ({
      url: new URL(post.url, baseUrl).toString(),
      lastModified: now,
    })),
  ]

  const dedupedEntries = new Map<string, MetadataRoute.Sitemap[number]>()

  for (const entry of entries) {
    dedupedEntries.set(entry.url, entry)
  }

  return Array.from(dedupedEntries.values())
}
