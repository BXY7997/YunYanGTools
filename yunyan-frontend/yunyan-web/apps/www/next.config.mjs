/** @type {import('next').NextConfig} */
const nextConfig = {
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
        destination: "/",
        permanent: true,
      },
      {
        source: "/docs/:path*",
        destination: "/",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
