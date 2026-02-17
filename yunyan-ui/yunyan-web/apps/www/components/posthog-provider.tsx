"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { PostHogProvider } from "posthog-js/react"

import {
  capturePosthog,
  isPosthogEnabled,
  posthogClient,
  posthogToken,
} from "@/lib/posthog"

if (typeof window !== "undefined" && isPosthogEnabled) {
  posthogClient.init(posthogToken, {
    api_host: "https://app.posthog.com",
    capture_pageview: true,
    session_recording: {
      maskAllInputs: false,
    },
    // Enable debug mode in development
    loaded: (client) => {
      if (process.env.NODE_ENV === "development") client.debug()
    },
  })
}

export function PostHogPageview(): React.ReactNode {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!isPosthogEnabled || !pathname) {
      return
    }

    let url = window.origin + pathname
    if (searchParams && searchParams.toString()) {
      url = url + `?${searchParams.toString()}`
    }

    capturePosthog("$pageview", {
      $current_url: url,
    })
  }, [pathname, searchParams])

  return <></>
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  if (!isPosthogEnabled) {
    return <>{children}</>
  }

  return <PostHogProvider client={posthogClient}>{children}</PostHogProvider>
}
