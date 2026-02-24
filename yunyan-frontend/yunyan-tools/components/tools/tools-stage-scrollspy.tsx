"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface StageScrollspyItem {
  id: string
  title: string
  summary: string
  order: number
  toolCount: number
  toneClass: string
}

interface ToolsStageScrollspyProps {
  stages: StageScrollspyItem[]
}

export function ToolsStageScrollspy({ stages }: ToolsStageScrollspyProps) {
  const [activeId, setActiveId] = React.useState(stages[0]?.id ?? "")
  const frameRef = React.useRef<number | null>(null)
  const scrollAnimFrameRef = React.useRef<number | null>(null)
  const scrollLockRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!stages.length) {
      setActiveId("")
      return
    }

    const sections = stages
      .map((stage) => document.getElementById(stage.id))
      .filter((section): section is HTMLElement => Boolean(section))

    if (!sections.length) {
      return
    }

    const resolveActiveId = () => {
      if (scrollLockRef.current) {
        return
      }

      // Use one consistent pivot for both scroll matching and click positioning.
      const anchorOffset = 104
      const pivotY = window.scrollY + anchorOffset
      let nextActiveId = sections[0].id

      for (const section of sections) {
        const sectionTop = section.getBoundingClientRect().top + window.scrollY
        if (sectionTop <= pivotY) {
          nextActiveId = section.id
          continue
        }
        break
      }

      setActiveId((previousId) =>
        previousId === nextActiveId ? previousId : nextActiveId
      )
    }

    const hash = window.location.hash.replace("#", "")
    if (hash && sections.some((section) => section.id === hash)) {
      setActiveId(hash)
    }
    resolveActiveId()

    const requestResolve = () => {
      if (frameRef.current != null) {
        return
      }
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null
        resolveActiveId()
      })
    }

    const handleHashChange = () => {
      const nextHash = window.location.hash.replace("#", "")
      if (nextHash && sections.some((section) => section.id === nextHash)) {
        setActiveId(nextHash)
        return
      }
      requestResolve()
    }

    window.addEventListener("scroll", requestResolve, { passive: true })
    window.addEventListener("resize", requestResolve)
    window.addEventListener("hashchange", handleHashChange)

    return () => {
      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
      if (scrollAnimFrameRef.current != null) {
        window.cancelAnimationFrame(scrollAnimFrameRef.current)
        scrollAnimFrameRef.current = null
      }
      scrollLockRef.current = null
      window.removeEventListener("scroll", requestResolve)
      window.removeEventListener("resize", requestResolve)
      window.removeEventListener("hashchange", handleHashChange)
    }
  }, [stages])

  const handleStageClick = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
      event.preventDefault()

      const section = document.getElementById(sectionId)
      if (!section) {
        return
      }

      setActiveId(sectionId)
      const anchorOffset = 104
      const targetTop =
        section.getBoundingClientRect().top + window.scrollY - anchorOffset
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
      const finalTop = Math.max(targetTop, 0)
      const startTop = window.scrollY
      const delta = finalTop - startTop

      if (scrollAnimFrameRef.current != null) {
        window.cancelAnimationFrame(scrollAnimFrameRef.current)
        scrollAnimFrameRef.current = null
      }

      scrollLockRef.current = sectionId

      if (reduceMotion || Math.abs(delta) < 2) {
        window.scrollTo({ top: finalTop, behavior: "auto" })
        scrollLockRef.current = null
        window.history.replaceState(null, "", `#${sectionId}`)
        return
      }

      const duration = Math.min(620, Math.max(360, Math.abs(delta) * 0.35))
      const startedAt = performance.now()
      const easeInOutCubic = (progress: number) =>
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2

      const tick = (now: number) => {
        const elapsed = now - startedAt
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = easeInOutCubic(progress)
        window.scrollTo({
          top: startTop + delta * easedProgress,
          behavior: "auto",
        })

        if (progress < 1) {
          scrollAnimFrameRef.current = window.requestAnimationFrame(tick)
          return
        }

        scrollAnimFrameRef.current = null
        scrollLockRef.current = null
        setActiveId(sectionId)
        window.history.replaceState(null, "", `#${sectionId}`)
      }

      scrollAnimFrameRef.current = window.requestAnimationFrame(tick)
    },
    []
  )

  return (
    <nav
      aria-label="流程阶段导航"
      className="rounded-2xl border border-border bg-card p-4 shadow-[0_8px_24px_hsl(var(--foreground)/0.05)]"
    >
      <div className="mb-3 space-y-0.5 text-center">
        <p className="text-sm font-semibold text-foreground">流程导航</p>
        <p className="text-xs text-muted-foreground">点击跳转到对应阶段</p>
      </div>
      <div className="space-y-2.5" role="list">
        {stages.map((stage) => {
          const isActive = stage.id === activeId
          return (
            <a
              role="listitem"
              key={stage.id}
              href={`#${stage.id}`}
              onClick={(event) => handleStageClick(event, stage.id)}
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "group/nav relative flex min-h-12 cursor-pointer gap-3 rounded-xl border px-3 py-2.5 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none",
                isActive
                  ? "border-primary/30 bg-primary/[0.06] shadow-[0_8px_18px_hsl(var(--foreground)/0.06)]"
                  : "border-border/90 bg-background hover:border-primary/20 hover:bg-muted/35"
              )}
            >
              <span
                className={cn(
                  "z-10 inline-flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors duration-200 ease-out motion-reduce:transition-none",
                  isActive
                    ? "border-primary/40 bg-primary/90 text-primary-foreground"
                    : "border-border bg-muted/80 text-muted-foreground"
                )}
              >
                {stage.order}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block text-sm font-semibold text-foreground",
                    isActive && "text-foreground"
                  )}
                >
                  {stage.title}
                </span>
                <span className="mt-0.5 line-clamp-2 block text-[11px] leading-5 text-muted-foreground">
                  {stage.summary}
                </span>
                <span className="mt-1 block text-[10px] text-muted-foreground">
                  {`${stage.toolCount} 个关键工具`}
                </span>
              </span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}
