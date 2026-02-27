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
  serverExternalPackages: ["@prisma/client"],
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Avoid runtime `eval` parsing issues in browser dev chunks (e.g. app/layout.js).
      config.devtool = "cheap-module-source-map"
    }

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
