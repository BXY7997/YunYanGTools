"use client"

import { useEffect, useState } from "react"
import { ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { RippleButton } from "@/components/magicui/ripple-button"

const SHOW_AFTER_SCROLL_Y = 360
const MOBILE_BASE_OFFSET = 24
const DESKTOP_BASE_OFFSET = 32
const PROGRESS_RING_RADIUS = 24
const PROGRESS_RING_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RING_RADIUS

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [bottomOffset, setBottomOffset] = useState(MOBILE_BASE_OFFSET)

  useEffect(() => {
    const updateState = () => {
      setIsVisible(window.scrollY > SHOW_AFTER_SCROLL_Y)
      const isDesktop = window.innerWidth >= 768
      const baseBottomOffset = isDesktop
        ? DESKTOP_BASE_OFFSET
        : MOBILE_BASE_OFFSET

      const maxScrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const currentProgress =
        maxScrollableHeight > 0
          ? Math.min((window.scrollY / maxScrollableHeight) * 100, 100)
          : 0

      setScrollProgress(currentProgress)
      setBottomOffset(baseBottomOffset)
    }

    let ticking = false

    const onScrollOrResize = () => {
      if (ticking) {
        return
      }

      ticking = true
      window.requestAnimationFrame(() => {
        updateState()
        ticking = false
      })
    }

    updateState()
    window.addEventListener("scroll", onScrollOrResize, { passive: true })
    window.addEventListener("resize", onScrollOrResize)

    return () => {
      window.removeEventListener("scroll", onScrollOrResize)
      window.removeEventListener("resize", onScrollOrResize)
    }
  }, [])

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div
      className={cn(
        "pointer-events-none fixed right-[calc(1.5rem+env(safe-area-inset-right))] z-50 transition-all duration-300 md:right-[calc(2rem+env(safe-area-inset-right))]",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      )}
      style={{
        bottom: `calc(${bottomOffset}px + env(safe-area-inset-bottom))`,
      }}
    >
      <div className="relative size-14">
        <svg
          className="pointer-events-none absolute inset-0 -rotate-90"
          viewBox="0 0 56 56"
          aria-hidden="true"
        >
          <circle
            cx="28"
            cy="28"
            r={PROGRESS_RING_RADIUS}
            stroke="hsl(var(--border))"
            strokeWidth="2.5"
            fill="none"
            opacity="0.65"
          />
          <circle
            cx="28"
            cy="28"
            r={PROGRESS_RING_RADIUS}
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: PROGRESS_RING_CIRCUMFERENCE,
              strokeDashoffset:
                PROGRESS_RING_CIRCUMFERENCE -
                (scrollProgress / 100) * PROGRESS_RING_CIRCUMFERENCE,
              transition: "stroke-dashoffset 220ms ease-out",
            }}
          />
        </svg>

        <RippleButton
          aria-label="返回顶部"
          title="返回顶部"
          onClick={handleBackToTop}
          rippleColor="rgba(99, 102, 241, 0.35)"
          className="border-border/70 bg-background/95 text-foreground pointer-events-auto absolute top-1.5 left-1.5 !size-11 !rounded-full !p-0 shadow-lg backdrop-blur-sm"
        >
          <ChevronUp className="size-5" />
        </RippleButton>
      </div>
    </div>
  )
}
