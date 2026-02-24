"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Compass } from "lucide-react"

import { ToolBadgeChip } from "@/components/tools/tool-badge"
import { ToolIcon } from "@/components/tools/tool-icon"
import type { ToolBadge, ToolIconName } from "@/types/tools"

interface ToolsHeroSpotlightProps {
  spotlight: {
    id: string
    route: string
    title: string
    summary?: string
    icon: ToolIconName
    badge?: ToolBadge
  }
  previewSrc: string
}

const heroHighlights = [
  "需求分析",
  "系统设计",
  "开发验证",
  "文档交付",
  "合规收口",
]

export function ToolsHeroSpotlight({
  spotlight,
  previewSrc,
}: ToolsHeroSpotlightProps) {
  return (
    <section
      aria-labelledby="tools-hero-title"
      className="relative rounded-[28px] border border-border bg-card p-4 md:p-5"
    >
      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-2.5">
          <span className="inline-flex size-9 items-center justify-center rounded-2xl border border-border bg-muted text-primary">
            <Compass className="size-4" />
          </span>
          <h1
            id="tools-hero-title"
            className="font-heading text-2xl text-card-foreground md:text-3xl"
          >
            毕业设计全流程工具导航
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            从需求到答辩，把每个阶段要用的工具按顺序组织到同一工作流里。
            左侧流程会随滚动自动定位到当前阶段，直接点击卡片即可进入工具。
          </p>
          <div className="flex flex-nowrap gap-1.5 overflow-x-auto overflow-y-hidden">
            {heroHighlights.map((item) => (
              <span
                key={item}
                className="shrink-0 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <article className="rounded-2xl border border-border bg-muted/30 p-2.5">
          <Link
            href={spotlight.route}
            aria-label={`进入推荐工具 ${spotlight.title}`}
            className="group block overflow-hidden rounded-xl border border-border bg-background transition-colors duration-200 hover:border-primary/30 hover:shadow-[0_10px_22px_hsl(var(--foreground)/0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="relative">
              <Image
                src={previewSrc}
                alt={`${spotlight.title} 预览`}
                width={960}
                height={560}
                priority
                sizes="(max-width: 1024px) 100vw, 300px"
                className="h-24 w-full object-cover contrast-[.95] saturate-[.82] transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                <ToolIcon name={spotlight.icon} className="size-3.5" />
                推荐工具
              </span>
            </div>
            <div className="space-y-1.5 p-2.5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-foreground">
                  {spotlight.title}
                </h2>
                <ToolBadgeChip badge={spotlight.badge} />
              </div>
              <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                {spotlight.summary}
              </p>
              <span className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-primary/40 bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                立即体验
                <ArrowRight className="size-3.5" />
              </span>
            </div>
          </Link>
        </article>
      </div>
    </section>
  )
}
