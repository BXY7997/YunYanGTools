import { createMDX } from "fumadocs-mdx/next"

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./registry/**/*", "./content/**/*"],
  },
  devIndicators: false,
  reactStrictMode: true,
  experimental: {
    inlineCss: true,
  },
  images: {
    domains: [
      "localhost",
      "cdn.magicui.design",
      "images.unsplash.com",
      "picsum.photos",
      "img.youtube.com",
      "pbs.twimg.com",
    ],
  },
  async redirects() {
    return [
      {
        source: "/aboout",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/canvas",
        destination: "/news",
        permanent: true,
      },
      {
        source: "/discord",
        destination: "https://discord.gg/X4BBMBjHNf",
        permanent: true,
      },
      {
        source: "/components",
        destination: "/docs/components",
        permanent: true,
      },
      {
        source: "/showcase/:path*.mdx",
        destination: "/showcase/:path*.md",
        permanent: true,
      },
      {
        source: "/blog/:path*.mdx",
        destination: "/blog/:path*.md",
        permanent: true,
      },
      {
        source: "/docs/:path*.mdx",
        destination: "/docs/:path*.md",
        permanent: true,
      },
      {
        source: "/r/:path([^.]*)",
        destination: "/r/:path.json",
        permanent: true,
      },
    ]
  },
  rewrites() {
    return [
      {
        source: "/docs/:path*.md",
        destination: "/llm/:path*",
      },
    ]
  },
}

const withMDX = createMDX({})

export default withMDX(nextConfig)
