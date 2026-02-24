import Link from "next/link"
import * as React from "react"
import { AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ToolPromoContent } from "@/features/tools/shared/constants/tool-promo"

export function ToolSectionHeading({
  title,
  description,
  className,
}: {
  title: string
  description: string
  className?: string
}) {
  return (
    <div className={className}>
      <h2 className="mb-2 text-2xl font-semibold text-foreground">{title}</h2>
      <p className="mb-2 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export function ToolPromoNotice({
  content,
  icon,
  className,
}: {
  content: ToolPromoContent
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "tools-word-banner flex flex-col gap-3 rounded-2xl p-5 shadow-lg md:flex-row md:items-center",
        className
      )}
    >
      <div className="flex-1 space-y-2">
        <p className="tools-word-banner-kicker inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide">
          {icon}
          {content.kicker}
        </p>
        <h3 className="tools-word-banner-title text-xl font-semibold">
          {content.title}
        </h3>
        <p className="tools-word-banner-desc text-sm">{content.description}</p>
      </div>
      <Link
        href={content.actionHref}
        className="tools-word-banner-cta tools-word-button-transition inline-flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium shadow-md transition-colors md:w-auto"
      >
        {content.actionLabel}
      </Link>
    </section>
  )
}

export function ToolAiGeneratedDisclaimer({
  text = "此功能涉及到AI生成内容，不代表本站立场，使用前请仔细判别。",
  className,
}: {
  text?: string
  className?: string
}) {
  return (
    <p
      className={cn(
        "flex items-center justify-center gap-1 text-center text-xs text-muted-foreground/80",
        className
      )}
    >
      <AlertCircle className="size-3.5" />
      <span>{text}</span>
    </p>
  )
}

export function ToolChecklistCard({
  title,
  items,
  className,
}: {
  title: string
  items: string[]
  className?: string
}) {
  return (
    <div className={cn("tools-preview-shell rounded-lg p-3", className)}>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <ul className="mt-3 list-disc space-y-1.5 pl-4">
        {items.map((item) => (
          <li key={item} className="text-[13px] leading-snug text-muted-foreground">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ToolFaqItem({
  question,
  answer,
  className,
}: {
  question: string
  answer: string
  className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <h3 className="text-sm font-semibold leading-6 text-foreground">
        {question}
      </h3>
      <p className="text-sm leading-6 text-muted-foreground/95">{answer}</p>
    </div>
  )
}
