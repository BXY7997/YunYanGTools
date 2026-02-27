import Image from "next/image"
import Link from "next/link"
import { ArrowRight, GraduationCap } from "lucide-react"
import type { CSSProperties } from "react"

import { getFlatToolLinks, getToolGroupByChildId } from "@/config/tools-registry"
import { ToolBadgeChip } from "@/components/tools/tool-badge"
import { ToolIcon } from "@/components/tools/tool-icon"
import { toolsLayoutTokens } from "@/features/tools/shared/constants/tools-layout-tokens"
import { cn } from "@/lib/utils"
import type { ToolMenuLinkItem } from "@/types/tools"

interface StageDefinition {
  id: string
  toolIds: string[]
}

const stageDefinitions: StageDefinition[] = [
  {
    id: "stage-discovery",
    toolIds: ["feature-structure", "use-case-doc", "mind-map"],
  },
  {
    id: "stage-architecture",
    toolIds: ["er-diagram", "architecture-diagram", "software-engineering"],
  },
  {
    id: "stage-development",
    toolIds: ["pseudo-code", "code-runner", "test-doc"],
  },
  {
    id: "stage-delivery",
    toolIds: ["smart-doc", "sql-to-table", "word-table", "file-collector"],
  },
  {
    id: "stage-governance",
    toolIds: ["aigc-check", "aigc-reduce", "paper-rewrite", "cover-card"],
  },
]

const stageTheme = {
  chip: "border-primary/20 bg-primary/10 text-primary",
  ring: "hover:border-primary/35 hover:bg-muted/40 dark:hover:border-primary/50",
  button:
    "border-primary/40 bg-primary text-primary-foreground hover:bg-primary/90",
}

const toolPreviewImageMap: Record<string, string> = {
  "feature-structure": "/canvas-assets/pilot.png",
  "use-case-doc": "/images/blog/blog-post-1.jpg",
  "mind-map": "/canvas-assets/reflecting.png",
  "er-diagram": "/canvas-assets/cube-leg.png",
  "architecture-diagram": "/canvas-assets/looking-ahead.png",
  "software-engineering": "/canvas-assets/growth.png",
  "pseudo-code": "/images/blog/blog-post-2.jpg",
  "code-runner": "/images/blog/blog-post-4.jpg",
  "test-doc": "/images/hero.png",
  "smart-doc": "/og.jpg",
  "sql-to-table": "/images/blog/blog-post-1.jpg",
  "word-table": "/images/blog/blog-post-2.jpg",
  "file-collector": "/images/blog/blog-post-3.jpg",
  "aigc-check": "/images/blog/blog-post-4.jpg",
  "aigc-reduce": "/canvas-assets/looking-ahead.png",
  "paper-rewrite": "/canvas-assets/reflecting.png",
  "cover-card": "/images/hero.png",
}

const toolPreviewFallbacks = [
  "/canvas-assets/looking-ahead.png",
  "/canvas-assets/pilot.png",
  "/canvas-assets/reflecting.png",
  "/canvas-assets/growth.png",
  "/images/hero.png",
]

const toolsThemeStyle: CSSProperties = {
  "--primary": "221 83% 53%",
  "--primary-foreground": "210 40% 98%",
  "--muted": "220 14% 96%",
  "--muted-foreground": "215 16% 38%",
  "--secondary": "220 14% 96%",
  "--secondary-foreground": "222 47% 11%",
  "--accent": "220 14% 96%",
  "--accent-foreground": "222 47% 11%",
  "--border": "220 13% 91%",
  "--ring": "221 83% 53%",
} as CSSProperties

function resolvePanelTools(tools: ToolMenuLinkItem[]) {
  const toolMap = new Map(tools.map((tool) => [tool.id, tool]))
  const ids = stageDefinitions.flatMap((stage) => stage.toolIds)
  const used = new Set<string>()
  const orderedTools = ids
    .map((toolId) => {
      const tool = toolMap.get(toolId)
      if (!tool || used.has(tool.id)) {
        return null
      }
      used.add(tool.id)
      return tool
    })
    .filter((tool): tool is ToolMenuLinkItem => Boolean(tool))

  const fallbackTools = tools.filter((tool) => !used.has(tool.id))
  return orderedTools.concat(fallbackTools)
}

function getToolPreviewSrc(toolId: string, fallbackIndex: number) {
  return (
    toolPreviewImageMap[toolId] ||
    toolPreviewFallbacks[fallbackIndex % toolPreviewFallbacks.length]
  )
}

export function AppsCenter() {
  const links = getFlatToolLinks().filter((item) =>
    item.route.startsWith("/apps/")
  )
  const tools = resolvePanelTools(links)
  const hotCount = tools.filter((item) => item.badge === "hot").length
  const newCount = tools.filter(
    (item) => item.badge === "new" || item.badge === "newProduct"
  ).length

  return (
    <div
      style={toolsThemeStyle}
      className={cn(
        toolsLayoutTokens.toolsHub.shellClass,
        toolsLayoutTokens.toolsHub.pagePaddingClass
      )}
    >
      <div className={toolsLayoutTokens.toolsHub.sectionGapClass}>
        <section
          className={cn(
            "rounded-2xl border border-border bg-card",
            toolsLayoutTokens.toolsHub.sectionPaddingClass
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl space-y-2.5">
              <span className="inline-flex size-9 items-center justify-center rounded-2xl border border-border bg-muted text-primary">
                <GraduationCap className="size-4" />
              </span>
              <h1 className="font-heading text-2xl text-card-foreground md:text-3xl">
                校园小助手
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                一站式解决你的学习开发需求
              </p>
            </div>

            <div className="grid gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground sm:grid-cols-3 sm:gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  Tool Total
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {tools.length}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  Hot
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {hotCount}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  New
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {newCount}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          className={cn(
            "rounded-2xl border border-border bg-card",
            toolsLayoutTokens.toolsHub.sectionPaddingClass
          )}
        >
          <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-2xl text-card-foreground">
              应用中心
            </h2>
            <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
              {`${tools.length} 个工具`}
            </span>
          </header>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tools.map((tool, index) => {
              const group = getToolGroupByChildId(tool.id)
              const previewSrc = getToolPreviewSrc(tool.id, index)

              return (
                <Link
                  key={tool.id}
                  href={tool.route}
                  aria-label={`进入 ${tool.title}`}
                  className={cn(
                    "group flex h-full cursor-pointer flex-col rounded-xl border border-border bg-background p-3 transition-colors duration-200 hover:shadow-[0_8px_20px_hsl(var(--foreground)/0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    stageTheme.ring
                  )}
                >
                  <div className="relative mb-3 overflow-hidden rounded-lg border border-border bg-muted/20">
                    <Image
                      src={previewSrc}
                      alt={`${tool.title} 预览缩略图`}
                      width={960}
                      height={560}
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      className="h-36 w-full object-cover contrast-[.95] saturate-[.82] transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
                    <div className="absolute inset-x-2 top-2 flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "inline-flex min-w-0 items-center gap-1 rounded-md border px-2 py-0.5 text-[11px]",
                          stageTheme.chip
                        )}
                      >
                        <ToolIcon name={tool.icon} className="size-3.5" />
                        <span className="truncate">
                          {group?.title || "快捷工具"}
                        </span>
                      </span>
                      <ToolBadgeChip badge={tool.badge} />
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-foreground">
                    {tool.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-xs leading-6 text-muted-foreground">
                    {tool.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(tool.tags || []).slice(0, 3).map((tag) => (
                      <span
                        key={`${tool.id}-${tag}`}
                        className="rounded-full border border-border bg-card px-2 py-1 text-[11px] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span
                    className={cn(
                      "mt-3 inline-flex h-9 items-center justify-center gap-1 rounded-lg border text-xs font-medium transition-colors",
                      stageTheme.button
                    )}
                  >
                    立即体验
                    <ArrowRight className="size-3.5" />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
