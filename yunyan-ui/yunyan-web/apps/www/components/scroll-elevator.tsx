"use client"

import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const SHOW_AFTER_SCROLL_Y = 240
const EDGE_THRESHOLD = 48
const MIN_SCROLLABLE_HEIGHT = 360
const MOBILE_BASE_OFFSET = 24
const DESKTOP_BASE_OFFSET = 32

export function ScrollElevator() {
  const [isVisible, setIsVisible] = useState(false)
  const [isAtTop, setIsAtTop] = useState(true)
  const [isAtBottom, setIsAtBottom] = useState(false)
  const [bottomOffset, setBottomOffset] = useState(MOBILE_BASE_OFFSET)

  useEffect(() => {
    const updateState = () => {
      const scrollY = window.scrollY
      const maxScrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const isScrollable = maxScrollableHeight > MIN_SCROLLABLE_HEIGHT
      const isDesktop = window.innerWidth >= 768
      const baseBottomOffset = isDesktop
        ? DESKTOP_BASE_OFFSET
        : MOBILE_BASE_OFFSET

      setIsVisible(isScrollable && scrollY > SHOW_AFTER_SCROLL_Y)
      setIsAtTop(scrollY <= EDGE_THRESHOLD)
      setIsAtBottom(maxScrollableHeight - scrollY <= EDGE_THRESHOLD)
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

  const getScrollBehavior = (): ScrollBehavior =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth"

  const handleToTop = () => {
    window.scrollTo({ top: 0, behavior: getScrollBehavior() })
  }

  const handleToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: getScrollBehavior(),
    })
  }

  return (
    <div
      className={cn(
        "pointer-events-none fixed right-[calc(1rem+env(safe-area-inset-right))] z-50 transition-all duration-250 md:right-[calc(1.5rem+env(safe-area-inset-right))]",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      )}
      style={{
        bottom: `calc(${bottomOffset}px + env(safe-area-inset-bottom))`,
      }}
    >
      <div className="bg-background/90 border-border/70 pointer-events-auto inline-flex flex-col gap-2 rounded-2xl border p-2 shadow-lg backdrop-blur-sm">
        <button
          type="button"
          aria-label="返回顶部"
          title="返回顶部"
          onClick={handleToTop}
          disabled={isAtTop}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "bg-background/80 size-10 rounded-xl shadow-none transition-colors",
            isAtTop ? "opacity-45" : "hover:bg-accent/70"
          )}
        >
          <ChevronUp className="size-4" />
        </button>
        <button
          type="button"
          aria-label="回到底部"
          title="回到底部"
          onClick={handleToBottom}
          disabled={isAtBottom}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "bg-background/80 size-10 rounded-xl shadow-none transition-colors",
            isAtBottom ? "opacity-45" : "hover:bg-accent/70"
          )}
        >
          <ChevronDown className="size-4" />
        </button>
      </div>
    </div>
  )
}
