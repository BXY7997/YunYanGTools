import * as React from "react"

import { cn } from "@/lib/utils"

export type ToolNoticeTone = "info" | "success" | "error"

export interface ToolConfigSummaryItem {
  key: string
  label: string
  value: string
}

export function ToolNoticeSlot({
  tone,
  text,
  className,
}: {
  tone: ToolNoticeTone
  text: string
  className?: string
}) {
  return (
    <div className={cn("flex min-h-5 items-center justify-center", className)}>
      {tone === "info" ? (
        <span className="sr-only">状态占位</span>
      ) : (
        <p
          role="status"
          aria-live="polite"
          className={cn(
            "text-center text-xs",
            tone === "error" ? "text-destructive" : "text-emerald-700"
          )}
        >
          {text}
        </p>
      )}
    </div>
  )
}

export function ToolConfigSummary({
  title = "当前生效配置",
  items = [],
  className,
}: {
  title?: string
  items?: ToolConfigSummaryItem[]
  className?: string
}) {
  const safeItems = Array.isArray(items) ? items : []

  if (safeItems.length === 0) {
    return null
  }

  return (
    <section
      className={cn(
        "mx-auto w-full max-w-4xl rounded-lg border border-border/70 bg-background/45 px-4 py-3",
        className
      )}
    >
      <p className="text-xs font-semibold tracking-wide text-foreground/85">
        {title}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {safeItems.map((item) => (
          <span
            key={item.key}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-2.5 py-1 text-xs text-muted-foreground"
          >
            <span className="text-foreground/80">{item.label}</span>
            <span>{item.value}</span>
          </span>
        ))}
      </div>
    </section>
  )
}
