import posthog from "posthog-js"

export const posthogToken = process.env.NEXT_PUBLIC_POSTHOG_API_KEY ?? ""
export const isPosthogEnabled = Boolean(posthogToken)
export const posthogClient = posthog

export function capturePosthog(
  eventName: string,
  properties?: Record<string, unknown>
) {
  if (!isPosthogEnabled) {
    return
  }

  posthogClient.capture(eventName, properties)
}
