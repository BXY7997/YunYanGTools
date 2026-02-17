import type { Metadata } from "next"

import { siteConfig } from "@/config/site"
import { absoluteUrl, constructMetadata } from "@/lib/utils"

interface MarketingMetadataOptions {
  title: string
  description: string
  path: string
  keywords?: string[]
}

function getPageTitle(title: string) {
  return `${title} | 云衍 YunYan`
}

export function createMarketingMetadata({
  title,
  description,
  path,
  keywords = [],
}: MarketingMetadataOptions): Metadata {
  const canonicalUrl = absoluteUrl(path)
  const pageTitle = getPageTitle(title)
  const mergedKeywords = Array.from(
    new Set([...siteConfig.keywords, ...keywords])
  )

  return constructMetadata({
    title: pageTitle,
    description,
    image: absoluteUrl("/og"),
    keywords: mergedKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description,
      type: "website",
      url: canonicalUrl,
      siteName: "云衍 YunYan",
      locale: "zh_CN",
      images: [
        {
          url: absoluteUrl("/og"),
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [absoluteUrl("/og")],
      creator: "@yunyanai",
    },
  })
}
