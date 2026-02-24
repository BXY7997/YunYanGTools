"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { ToolsStageScrollspy } from "@/components/tools/tools-stage-scrollspy"

interface StageScrollspyItem {
  id: string
  title: string
  summary: string
  order: number
  toolCount: number
  toneClass: string
}

interface ToolsStageFloatingRailProps {
  stages: StageScrollspyItem[]
}

const toolsThemeStyle: React.CSSProperties = {
  "--primary": "221 83% 53%",
  "--primary-foreground": "210 40% 98%",
  "--muted": "220 14% 96%",
  "--muted-foreground": "215 16% 38%",
  "--secondary": "220 14% 96%",
  "--secondary-foreground": "222 47% 11%",
  "--accent": "220 14% 96%",
  "--accent-foreground": "222 47% 11%",
  "--border": "220 13% 91%",
  "--ring": "221 83% 53%",
} as React.CSSProperties

export function ToolsStageFloatingRail({ stages }: ToolsStageFloatingRailProps) {
  const anchorRef = React.useRef<HTMLDivElement | null>(null)
  const frameRef = React.useRef<number | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const [layout, setLayout] = React.useState<{ left: number; width: number } | null>(
    null
  )

  const syncLayout = React.useCallback(() => {
    const rect = anchorRef.current?.getBoundingClientRect()
    if (!rect) {
      return
    }

    const viewportWidth = window.innerWidth
    const safeLeftMin = 8
    const safeLeftMax = Math.max(viewportWidth - rect.width - 8, safeLeftMin)
    const nextLayout = {
      left: Math.min(Math.max(rect.left, safeLeftMin), safeLeftMax),
      width: rect.width,
    }
    setLayout((previousLayout) => {
      if (!previousLayout) {
        return nextLayout
      }

      const sameLeft = Math.abs(previousLayout.left - nextLayout.left) < 0.5
      const sameWidth = Math.abs(previousLayout.width - nextLayout.width) < 0.5
      return sameLeft && sameWidth ? previousLayout : nextLayout
    })
  }, [])

  const requestSyncLayout = React.useCallback(() => {
    if (frameRef.current != null) {
      return
    }

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null
      syncLayout()
    })
  }, [syncLayout])

  React.useLayoutEffect(() => {
    setMounted(true)
    syncLayout()

    const anchorElement = anchorRef.current
    const resizeObserver = new ResizeObserver(() => requestSyncLayout())

    if (anchorElement) {
      resizeObserver.observe(anchorElement)
    }

    window.addEventListener("resize", requestSyncLayout)

    const handleTransition = () => {
      requestSyncLayout()
      const startedAt = performance.now()

      const tick = () => {
        requestSyncLayout()
        if (performance.now() - startedAt < 280) {
          window.requestAnimationFrame(tick)
        }
      }

      window.requestAnimationFrame(tick)
    }

    window.addEventListener("transitionstart", handleTransition, true)
    window.addEventListener("transitionend", requestSyncLayout, true)

    return () => {
      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
      resizeObserver.disconnect()
      window.removeEventListener("resize", requestSyncLayout)
      window.removeEventListener("transitionstart", handleTransition, true)
      window.removeEventListener("transitionend", requestSyncLayout, true)
    }
  }, [requestSyncLayout, syncLayout])

  const portalReady = mounted && Boolean(layout)

  return (
    <aside ref={anchorRef} className="relative">
      <div className="xl:hidden">
        <ToolsStageScrollspy stages={stages} />
      </div>

      <div
        style={toolsThemeStyle}
        className="hidden xl:sticky xl:top-1/2 xl:block xl:-translate-y-1/2"
      >
        {!portalReady ? (
          <ToolsStageScrollspy stages={stages} />
        ) : null}
      </div>

      {portalReady && layout
        ? createPortal(
            <div
              className="fixed top-1/2 z-30 hidden -translate-y-1/2 xl:block"
              style={{
                ...toolsThemeStyle,
                left: `${layout.left}px`,
                width: `${layout.width}px`,
              }}
            >
              <ToolsStageScrollspy stages={stages} />
            </div>,
            document.body
          )
        : null}
    </aside>
  )
}
