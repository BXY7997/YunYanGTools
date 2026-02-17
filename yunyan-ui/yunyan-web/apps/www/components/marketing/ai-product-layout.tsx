import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export const AI_PRODUCT_HERO_CONTAINER =
  "container py-[var(--ai-hero-py-mobile)] md:py-[var(--ai-hero-py-desktop)]"
export const AI_PRODUCT_SECTION_CONTAINER =
  "container pb-[var(--ai-section-pb-mobile)] md:pb-[var(--ai-section-pb-desktop)]"
export const AI_PRODUCT_ANCHOR_CONTAINER =
  "container scroll-mt-[var(--ai-anchor-scroll-mt)] pb-[var(--ai-section-pb-mobile)] md:pb-[var(--ai-section-pb-desktop)]"
export const AI_PRODUCT_TOC_ANCHOR_CONTAINER =
  "container scroll-mt-[var(--product-detail-anchor-offset,var(--ai-anchor-scroll-mt))] pb-[var(--ai-section-pb-mobile)] md:pb-[var(--ai-section-pb-desktop)]"

type AIProductLayoutDensity = "default" | "compact"

interface AIProductLayoutProps {
  children: ReactNode
  density?: AIProductLayoutDensity
  className?: string
}

const densityClassMap: Record<AIProductLayoutDensity, string> = {
  default:
    "[--ai-hero-py-mobile:3.5rem] [--ai-hero-py-desktop:4.5rem] [--ai-section-pb-mobile:2.5rem] [--ai-section-pb-desktop:3.5rem] [--ai-anchor-scroll-mt:6rem]",
  compact:
    "[--ai-hero-py-mobile:2.5rem] [--ai-hero-py-desktop:3.5rem] [--ai-section-pb-mobile:2rem] [--ai-section-pb-desktop:3rem] [--ai-anchor-scroll-mt:5.5rem]",
}

export function AIProductLayout({
  children,
  density = "default",
  className,
}: AIProductLayoutProps) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
        densityClassMap[density],
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[24rem] bg-[radial-gradient(120%_72%_at_50%_0%,rgba(158,122,255,0.2)_0%,rgba(254,139,187,0.12)_36%,rgba(255,255,255,0)_72%)] dark:bg-[radial-gradient(120%_72%_at_50%_0%,rgba(158,122,255,0.3)_0%,rgba(254,139,187,0.16)_40%,rgba(0,0,0,0)_76%)]"
      />
      <div
        aria-hidden
        className="from-muted/65 via-background/55 to-background pointer-events-none absolute inset-x-0 top-0 -z-20 h-[24rem] bg-linear-to-b"
      />
      {children}
    </div>
  )
}
