import { SiteConfig } from "types"

const appUrl =
  (process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3001").replace(
    /\/$/,
    ""
  )

export const siteConfig: SiteConfig = {
  name: "Taxonomy",
  description:
    "An open source application built using the new router, server components and everything new in Next.js 13.",
  url: appUrl,
  ogImage: `${appUrl}/og.jpg`,
  links: {
    twitter: "https://twitter.com/shadcn",
    github: "https://github.com/shadcn/taxonomy",
  },
}
