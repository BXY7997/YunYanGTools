import { withContentlayer } from "next-contentlayer"
import { createRequire } from "module"

import "./env.mjs"

const require = createRequire(import.meta.url)
let hasEmotionIsPropValid = true

try {
  require.resolve("@emotion/is-prop-valid")
} catch {
  hasEmotionIsPropValid = false
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
  serverExternalPackages: ["@prisma/client"],
  webpack: (config) => {
    if (!hasEmotionIsPropValid) {
      config.resolve ??= {}
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        "@emotion/is-prop-valid": false,
      }
    }

    return config
  },
}

export default withContentlayer(nextConfig)
