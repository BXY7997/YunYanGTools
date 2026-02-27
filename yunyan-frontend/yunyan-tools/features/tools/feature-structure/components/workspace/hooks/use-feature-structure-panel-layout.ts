"use client"

import * as React from "react"

import { clamp } from "@/features/tools/feature-structure/components/workspace/hooks/feature-structure-workspace-utils"

type ResizeSide = "left" | "right" | null

const useClientLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

interface UseFeatureStructurePanelLayoutOptions {
  leftWidth: number
  rightWidth: number
}

export function useFeatureStructurePanelLayout({
  leftWidth,
  rightWidth,
}: UseFeatureStructurePanelLayoutOptions) {
  const [layout, setLayout] = React.useState({
    leftWidth,
    rightWidth,
    leftCollapsed: false,
    rightCollapsed: false,
  })
  const [layoutReady, setLayoutReady] = React.useState(false)
  const [resizeSide, setResizeSide] = React.useState<ResizeSide>(null)
  const [focusMode, setFocusMode] = React.useState(false)

  const storageKey = "tools.workspace.layout.feature-structure"
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const resizeClientXRef = React.useRef<number | null>(null)
  const resizeRafRef = React.useRef<number | null>(null)

  useClientLayoutEffect(() => {
    const persistedLayout = window.localStorage.getItem(storageKey)
    if (!persistedLayout) {
      setLayoutReady(true)
      return
    }

    try {
      const parsed = JSON.parse(persistedLayout) as Partial<typeof layout>
      const normalizedLeftWidth =
        typeof parsed.leftWidth === "number" && Number.isFinite(parsed.leftWidth)
          ? clamp(parsed.leftWidth, 220, 360)
          : undefined
      const normalizedRightWidth =
        typeof parsed.rightWidth === "number" && Number.isFinite(parsed.rightWidth)
          ? clamp(parsed.rightWidth, 240, 340)
          : undefined
      setLayout((previous) => {
        const next = {
          ...previous,
          ...(normalizedLeftWidth !== undefined ? { leftWidth: normalizedLeftWidth } : null),
          ...(normalizedRightWidth !== undefined ? { rightWidth: normalizedRightWidth } : null),
          ...(typeof parsed.leftCollapsed === "boolean"
            ? { leftCollapsed: parsed.leftCollapsed }
            : null),
          ...(typeof parsed.rightCollapsed === "boolean"
            ? { rightCollapsed: parsed.rightCollapsed }
            : null),
        }

        if (
          next.leftWidth === previous.leftWidth &&
          next.rightWidth === previous.rightWidth &&
          next.leftCollapsed === previous.leftCollapsed &&
          next.rightCollapsed === previous.rightCollapsed
        ) {
          return previous
        }

        return next
      })
    } catch {
      // Ignore malformed persistence payload.
    } finally {
      setLayoutReady(true)
    }
  }, [])

  React.useEffect(() => {
    if (!layoutReady) {
      return
    }
    if (resizeSide) {
      return
    }

    const timerId = window.setTimeout(() => {
      window.localStorage.setItem(storageKey, JSON.stringify(layout))
    }, 80)

    return () => window.clearTimeout(timerId)
  }, [layout, layoutReady, resizeSide])

  useClientLayoutEffect(() => {
    if (!resizeSide) {
      return
    }

    const applyResizeByPointer = () => {
      resizeRafRef.current = null
      const clientX = resizeClientXRef.current
      if (clientX === null) {
        return
      }

      if (window.innerWidth < 1024 || !containerRef.current) {
        return
      }

      const bounds = containerRef.current.getBoundingClientRect()
      const minWidth = 220
      const maxLeftWidth = Math.min(360, bounds.width - 440)
      const maxRightWidth = Math.min(340, bounds.width - 440)

      if (resizeSide === "left") {
        const nextWidth = clamp(clientX - bounds.left, minWidth, maxLeftWidth)
        setLayout((previous) => {
          const unchanged =
            Math.abs(previous.leftWidth - nextWidth) < 1 && !previous.leftCollapsed
          if (unchanged) {
            return previous
          }
          return {
            ...previous,
            leftWidth: nextWidth,
            leftCollapsed: false,
          }
        })
        return
      }

      const nextRightWidth = clamp(bounds.right - clientX, 240, maxRightWidth)
      setLayout((previous) => {
        const unchanged =
          Math.abs(previous.rightWidth - nextRightWidth) < 1 && !previous.rightCollapsed
        if (unchanged) {
          return previous
        }
        return {
          ...previous,
          rightWidth: nextRightWidth,
          rightCollapsed: false,
        }
      })
    }

    const requestResize = () => {
      if (resizeRafRef.current !== null) {
        return
      }
      resizeRafRef.current = window.requestAnimationFrame(applyResizeByPointer)
    }

    const handleMouseMove = (event: MouseEvent) => {
      resizeClientXRef.current = event.clientX
      requestResize()
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        return
      }
      resizeClientXRef.current = event.clientX
      requestResize()
    }

    const handleMouseUp = () => {
      if (resizeRafRef.current !== null) {
        window.cancelAnimationFrame(resizeRafRef.current)
        resizeRafRef.current = null
      }
      applyResizeByPointer()
      resizeClientXRef.current = null
      setResizeSide(null)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("pointerup", handleMouseUp)
    window.addEventListener("pointercancel", handleMouseUp)
    window.addEventListener("blur", handleMouseUp)
    window.document.body.classList.add("cursor-col-resize")

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("pointerup", handleMouseUp)
      window.removeEventListener("pointercancel", handleMouseUp)
      window.removeEventListener("blur", handleMouseUp)
      window.document.body.classList.remove("cursor-col-resize")
      if (resizeRafRef.current !== null) {
        window.cancelAnimationFrame(resizeRafRef.current)
        resizeRafRef.current = null
      }
      resizeClientXRef.current = null
    }
  }, [resizeSide])

  const startResize = React.useCallback((side: Exclude<ResizeSide, null>, clientX: number) => {
    resizeClientXRef.current = clientX
    setResizeSide(side)
  }, [])

  const toggleLeftPanel = React.useCallback(() => {
    setLayout((previous) => ({
      ...previous,
      leftCollapsed: !previous.leftCollapsed,
    }))
  }, [])

  const toggleRightPanel = React.useCallback(() => {
    setLayout((previous) => ({
      ...previous,
      rightCollapsed: !previous.rightCollapsed,
    }))
  }, [])

  const toggleFocusMode = React.useCallback(() => {
    setFocusMode((previousFocus) => {
      setLayout((previousLayout) => ({
        ...previousLayout,
        leftCollapsed: !previousFocus,
        rightCollapsed: !previousFocus,
      }))
      return !previousFocus
    })
  }, [])

  return {
    containerRef,
    layout,
    layoutReady,
    resizeSide,
    setResizeSide,
    startResize,
    focusMode,
    toggleLeftPanel,
    toggleRightPanel,
    toggleFocusMode,
  }
}
