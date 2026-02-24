import { notFound } from "next/navigation"
import { allPages } from "contentlayer/generated"

import { Mdx } from "@/components/mdx-components"

import "@/styles/mdx.css"

interface PageProps {
  params: Promise<{
    slug: string[]
  }>
}

async function getPageFromParams(params: PageProps["params"]) {
  const { slug: slugParts } = await params
  const slug = slugParts?.join("/")
  if (!slug) {
    return null
  }

  const page = allPages.find((page) => page.slugAsParams === slug)
  return page ?? null
}

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  return allPages.map((page) => ({
    slug: page.slugAsParams.split("/"),
  }))
}

export default async function PagePage({ params }: PageProps) {
  const page = await getPageFromParams(params)

  if (!page) {
    notFound()
  }

  return (
    <article className="container max-w-3xl py-6 lg:py-12">
      <div className="space-y-4">
        <h1 className="inline-block font-heading text-4xl lg:text-5xl">
          {page.title}
        </h1>
        {page.description && (
          <p className="text-xl text-muted-foreground">{page.description}</p>
        )}
      </div>
      <hr className="my-4" />
      <Mdx code={page.body.code} />
    </article>
  )
}
