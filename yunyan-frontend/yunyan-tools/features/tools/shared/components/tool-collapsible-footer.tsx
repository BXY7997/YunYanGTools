"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

interface ToolCollapsibleFooterProps {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  defaultCollapsed?: boolean
  collapsedHint?: string
  expandLabel?: string
  collapseLabel?: string
}

export function ToolCollapsibleFooter({
  children,
  className,
  contentClassName,
  defaultCollapsed = true,
  collapsedHint = "底部包含使用指南与常见问题，点击展开查看。",
  expandLabel = "展开底部说明",
  collapseLabel = "收起底部说明",
}: ToolCollapsibleFooterProps) {
  const contentId = React.useId()
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const rafRef = React.useRef<number | null>(null)
  const [expanded, setExpanded] = React.useState(!defaultCollapsed)
  const [renderContent, setRenderContent] = React.useState(!defaultCollapsed)
  const [contentHeight, setContentHeight] = React.useState<number | "auto">(
    defaultCollapsed ? 0 : "auto"
  )

  const cancelPendingFrame = React.useCallback(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const measureContentHeight = React.useCallback(() => {
    return contentRef.current?.scrollHeight ?? 0
  }, [])

  const expandContent = React.useCallback(() => {
    cancelPendingFrame()
    setRenderContent(true)
    setExpanded(true)
    setContentHeight(0)
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = window.requestAnimationFrame(() => {
        setContentHeight(measureContentHeight())
      })
    })
  }, [cancelPendingFrame, measureContentHeight])

  const collapseContent = React.useCallback(() => {
    cancelPendingFrame()
    setContentHeight(measureContentHeight())
    rafRef.current = window.requestAnimationFrame(() => {
      setExpanded(false)
      setContentHeight(0)
    })
  }, [cancelPendingFrame, measureContentHeight])

  const handleToggle = React.useCallback(() => {
    if (expanded) {
      collapseContent()
      return
    }
    expandContent()
  }, [collapseContent, expandContent, expanded])

  const handleTransitionEnd = React.useCallback(
    (event: React.TransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget || event.propertyName !== "height") {
        return
      }

      if (expanded) {
        setContentHeight("auto")
        return
      }

      setRenderContent(false)
    },
    [expanded]
  )

  React.useEffect(() => {
    return () => {
      cancelPendingFrame()
    }
  }, [cancelPendingFrame])

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-2">
        <p className="text-xs leading-5 text-muted-foreground/90">
          {expanded ? "底部说明已展开，可继续阅读后收起。" : collapsedHint}
        </p>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={handleToggle}
          className={cn(
            "tools-word-button-transition inline-flex h-7 items-center gap-1 rounded-full border border-border/70 bg-background/60 px-2.5 text-[11px] font-medium text-muted-foreground shadow-sm hover:border-border hover:text-foreground",
            expanded ? "border-border text-foreground" : undefined
          )}
        >
          <span>{expanded ? collapseLabel : expandLabel}</span>
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform duration-200 ease-out motion-reduce:transition-none",
              expanded ? "rotate-180" : "rotate-0"
            )}
          />
        </button>
      </div>

      <div
        id={contentId}
        aria-hidden={!expanded}
        onTransitionEnd={handleTransitionEnd}
        className={cn(
          "overflow-hidden pt-0.5 transition-[height,opacity] duration-300 ease-out motion-reduce:transition-none",
          expanded ? "opacity-100" : "opacity-60"
        )}
        style={{ height: contentHeight === "auto" ? "auto" : `${contentHeight}px` }}
      >
        {renderContent ? (
          <div ref={contentRef} className={contentClassName}>
            {children}
          </div>
        ) : null}
      </div>
    </div>
  )
}
