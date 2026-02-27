import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

const isProduction = process.env.NODE_ENV === "production"
const developmentFallback = {
  NEXTAUTH_SECRET: "dev-nextauth-secret",
  GITHUB_CLIENT_ID: "dev-github-client-id",
  GITHUB_CLIENT_SECRET: "dev-github-client-secret",
  GITHUB_ACCESS_TOKEN: "dev-github-access-token",
  DATABASE_URL: "file:./dev.db",
  SMTP_FROM: "noreply@example.com",
  POSTMARK_API_TOKEN: "dev-postmark-api-token",
  POSTMARK_SIGN_IN_TEMPLATE: "dev-sign-in-template",
  POSTMARK_ACTIVATION_TEMPLATE: "dev-activation-template",
  STRIPE_API_KEY: "sk_test_dev_placeholder",
  STRIPE_WEBHOOK_SECRET: "whsec_dev_placeholder",
  STRIPE_PRO_MONTHLY_PLAN_ID: "price_dev_placeholder",
  NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3001",
  NEXT_PUBLIC_MARKETING_GITHUB_STARS: "22.4k",
}

export const env = createEnv({
  server: {
    // This is optional because it's only used in development.
    // See https://next-auth.js.org/deployment.
    NEXTAUTH_URL: z.string().url().optional(),
    NEXTAUTH_SECRET: z.string().min(1),
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
    GITHUB_ACCESS_TOKEN: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    SMTP_FROM: z.string().min(1),
    POSTMARK_API_TOKEN: z.string().min(1),
    POSTMARK_SIGN_IN_TEMPLATE: z.string().min(1),
    POSTMARK_ACTIVATION_TEMPLATE: z.string().min(1),
    STRIPE_API_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    STRIPE_PRO_MONTHLY_PLAN_ID: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1),
    NEXT_PUBLIC_MARKETING_GITHUB_STARS: z.string().optional(),
  },
  runtimeEnv: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET:
      process.env.NEXTAUTH_SECRET ||
      (!isProduction ? developmentFallback.NEXTAUTH_SECRET : undefined),
    GITHUB_CLIENT_ID:
      process.env.GITHUB_CLIENT_ID ||
      (!isProduction ? developmentFallback.GITHUB_CLIENT_ID : undefined),
    GITHUB_CLIENT_SECRET:
      process.env.GITHUB_CLIENT_SECRET ||
      (!isProduction ? developmentFallback.GITHUB_CLIENT_SECRET : undefined),
    GITHUB_ACCESS_TOKEN:
      process.env.GITHUB_ACCESS_TOKEN ||
      (!isProduction ? developmentFallback.GITHUB_ACCESS_TOKEN : undefined),
    DATABASE_URL:
      process.env.DATABASE_URL ||
      (!isProduction ? developmentFallback.DATABASE_URL : undefined),
    SMTP_FROM:
      process.env.SMTP_FROM ||
      (!isProduction ? developmentFallback.SMTP_FROM : undefined),
    POSTMARK_API_TOKEN:
      process.env.POSTMARK_API_TOKEN ||
      (!isProduction ? developmentFallback.POSTMARK_API_TOKEN : undefined),
    POSTMARK_SIGN_IN_TEMPLATE:
      process.env.POSTMARK_SIGN_IN_TEMPLATE ||
      (!isProduction
        ? developmentFallback.POSTMARK_SIGN_IN_TEMPLATE
        : undefined),
    POSTMARK_ACTIVATION_TEMPLATE:
      process.env.POSTMARK_ACTIVATION_TEMPLATE ||
      (!isProduction
        ? developmentFallback.POSTMARK_ACTIVATION_TEMPLATE
        : undefined),
    STRIPE_API_KEY:
      process.env.STRIPE_API_KEY ||
      (!isProduction ? developmentFallback.STRIPE_API_KEY : undefined),
    STRIPE_WEBHOOK_SECRET:
      process.env.STRIPE_WEBHOOK_SECRET ||
      (!isProduction ? developmentFallback.STRIPE_WEBHOOK_SECRET : undefined),
    STRIPE_PRO_MONTHLY_PLAN_ID:
      process.env.STRIPE_PRO_MONTHLY_PLAN_ID ||
      (!isProduction
        ? developmentFallback.STRIPE_PRO_MONTHLY_PLAN_ID
        : undefined),
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ||
      (!isProduction ? developmentFallback.NEXT_PUBLIC_APP_URL : undefined),
    NEXT_PUBLIC_MARKETING_GITHUB_STARS:
      process.env.NEXT_PUBLIC_MARKETING_GITHUB_STARS ||
      (!isProduction
        ? developmentFallback.NEXT_PUBLIC_MARKETING_GITHUB_STARS
        : undefined),
  },
})
