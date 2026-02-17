import { Metadata } from "next"
import { notFound } from "next/navigation"

import { siteConfig } from "@/config/site"
import { showcaseSource } from "@/lib/source"
import { absoluteUrl } from "@/lib/utils"
import { ShowcaseCard } from "@/components/sections/showcase"

export const revalidate = false
export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return showcaseSource.generateParams()
}

interface PageProps {
  params: Promise<{
    slug: string[]
  }>
}

async function getDocFromParams({ params }: PageProps) {
  const { slug } = await params
  const page = showcaseSource.getPage(slug)
  if (!page) notFound()
  const doc = page.data
  if (!doc.title || !doc.description) {
    notFound()
  }

  return { doc, page }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { doc, page } = await getDocFromParams({ params })

  if (!page) {
    return {}
  }

  const metadataBaseUrl = process.env.NEXT_PUBLIC_APP_URL || siteConfig.url
  const canonicalUrl = absoluteUrl(page.url)
  const ogUrl = new URL("/og", metadataBaseUrl)
  ogUrl.searchParams.set("title", doc.title ?? "")
  ogUrl.searchParams.set("description", doc.description ?? "")

  return {
    title: doc.title,
    description: doc.description,
    alternates: {
      canonical: canonicalUrl,
    },
    keywords: [...siteConfig.keywords, "案例展示", doc.title],
    openGraph: {
      title: doc.title,
      description: doc.description,
      type: "article",
      url: canonicalUrl,
      siteName: "云衍 YunYan",
      locale: "zh_CN",
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: doc.title,
      description: doc.description,
      images: [ogUrl.toString()],
      creator: "@yunyanai",
    },
  }
}

export default async function PagePage({ params }: PageProps) {
  const { doc, page } = await getDocFromParams({ params })

  return (
    <article className="container max-w-2xl py-14">
      <h2 className="text-foreground mb-4 text-center text-5xl leading-[1.2] font-bold tracking-tighter">
        {doc.title}
      </h2>
      <h3 className="text-foreground/80 mx-auto mb-8 text-center text-lg font-medium tracking-tight text-balance">
        {doc.title} 基于云衍构建并发布了自己的项目展示页面。
      </h3>
      <ShowcaseCard
        title={doc.title ?? ""}
        href={doc.href ?? page.url}
        image={doc.image ?? ""}
        affiliation={doc.affiliation ?? ""}
      />
    </article>
  )
}
