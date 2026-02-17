"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

type PanelSide = "left" | "right"

interface PanelHandleProps {
  side: PanelSide
  collapsed: boolean
  onToggle: () => void
  className?: string
  openLabel: string
  closeLabel: string
}

const compactHandleClassName =
  "inline-flex h-7 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"

const edgeHandleClassName =
  "absolute top-1/2 inline-flex h-9 w-4 -translate-y-1/2 items-center justify-center rounded-md border border-border/80 bg-background/95 text-muted-foreground shadow-sm backdrop-blur transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"

function resolveIcon(side: PanelSide, collapsed: boolean, edge: boolean) {
  const iconClassName = edge ? "size-2.5" : "size-3.5"

  if (side === "left") {
    return collapsed ? (
      <ChevronRight className={iconClassName} />
    ) : (
      <ChevronLeft className={iconClassName} />
    )
  }

  return collapsed ? (
    <ChevronLeft className={iconClassName} />
  ) : (
    <ChevronRight className={iconClassName} />
  )
}

export function PanelCompactHandle({
  side,
  collapsed,
  onToggle,
  className,
  openLabel,
  closeLabel,
}: PanelHandleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(compactHandleClassName, className)}
      aria-label={collapsed ? openLabel : closeLabel}
    >
      {resolveIcon(side, collapsed, false)}
      <span className="hidden sm:inline">
        {collapsed ? openLabel : closeLabel}
      </span>
    </button>
  )
}

export function PanelEdgeHandle({
  side,
  collapsed,
  onToggle,
  className,
  openLabel,
  closeLabel,
}: PanelHandleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(edgeHandleClassName, className)}
      aria-label={collapsed ? openLabel : closeLabel}
    >
      {resolveIcon(side, collapsed, true)}
    </button>
  )
}
