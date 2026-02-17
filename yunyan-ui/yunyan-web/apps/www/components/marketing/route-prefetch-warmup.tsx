"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { docsConfig } from "@/config/docs"
import { PRODUCT_DETAILS, PRODUCT_ORDER } from "@/lib/product-catalog"

const WARMUP_ROUTES = Array.from(
  new Set([
    "/",
    ...docsConfig.mainNav
      .map((item) => item.href ?? "")
      .filter((href) => href.startsWith("/"))
      .map((href) => href.split("#")[0]),
    ...PRODUCT_ORDER.map((slug) => PRODUCT_DETAILS[slug].detailHref),
  ])
)

export function RoutePrefetchWarmup() {
  const router = useRouter()

  useEffect(() => {
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean }
      }
    ).connection as { saveData?: boolean } | undefined
    if (connection?.saveData) {
      return
    }

    const warmup = () => {
      for (const route of WARMUP_ROUTES) {
        router.prefetch(route)
      }
    }

    const idleId = requestIdleCallback(warmup, { timeout: 1200 })
    return () => {
      cancelIdleCallback(idleId)
    }
  }, [router])

  return null
}
