import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { CSSProperties } from "react"

import {
  getFlatToolLinks,
  getToolGroupByChildId,
} from "@/config/tools-registry"
import { ToolsStageFloatingRail } from "@/components/tools/tools-stage-floating-rail"
import { ToolsHeroSpotlight } from "@/components/tools/tools-hero-spotlight"
import { ToolBadgeChip } from "@/components/tools/tool-badge"
import { ToolIcon } from "@/components/tools/tool-icon"
import { cn } from "@/lib/utils"
import type { ToolMenuLinkItem } from "@/types/tools"

export const metadata = {
  title: "工具导航",
  description: "按阶段流程浏览工具，快速进入最佳工作区。",
}

interface StageDefinition {
  id: string
  label: string
  title: string
  summary: string
  toolIds: string[]
}

interface StageWithTools extends StageDefinition {
  tools: ToolMenuLinkItem[]
}

const stageDefinitions: StageDefinition[] = [
  {
    id: "stage-discovery",
    label: "阶段 01",
    title: "需求分析阶段",
    summary: "拆清问题边界、用例和核心目标，形成稳定输入。",
    toolIds: ["feature-structure", "use-case-doc", "mind-map"],
  },
  {
    id: "stage-architecture",
    label: "阶段 02",
    title: "系统设计阶段",
    summary: "完成数据模型、服务边界和工程流程的一体化设计。",
    toolIds: ["er-diagram", "architecture-diagram", "software-engineering"],
  },
  {
    id: "stage-development",
    label: "阶段 03",
    title: "代码开发阶段",
    summary: "将需求落地为可运行实现，并同步验证关键质量指标。",
    toolIds: ["pseudo-code", "course-code", "code-runner", "test-doc"],
  },
  {
    id: "stage-delivery",
    label: "阶段 04",
    title: "文档生成阶段",
    summary: "把设计与实现沉淀为标准文档，直接用于评审与提交。",
    toolIds: ["smart-doc", "sql-to-table", "word-table", "file-collector"],
  },
  {
    id: "stage-governance",
    label: "阶段 05",
    title: "辅助服务阶段",
    summary: "在提交前完成合规、降重和展示包装等收口动作。",
    toolIds: ["aigc-check", "aigc-reduce", "paper-rewrite", "cover-card"],
  },
]

const stageTheme = {
  chip: "border-primary/20 bg-primary/10 text-primary",
  ring: "hover:border-primary/35 hover:bg-muted/40 dark:hover:border-primary/50",
  button:
    "border-primary/40 bg-primary text-primary-foreground hover:bg-primary/90",
  line: "bg-primary/80",
}

const toolPreviewImageMap: Record<string, string> = {
  "feature-structure": "/canvas-assets/pilot.png",
  "use-case-doc": "/images/blog/blog-post-1.jpg",
  "mind-map": "/canvas-assets/reflecting.png",
  "er-diagram": "/canvas-assets/cube-leg.png",
  "architecture-diagram": "/canvas-assets/looking-ahead.png",
  "software-engineering": "/canvas-assets/growth.png",
  "pseudo-code": "/images/blog/blog-post-2.jpg",
  "course-code": "/images/blog/blog-post-3.jpg",
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

function getToolPreviewSrc(toolId: string, fallbackIndex: number) {
  return (
    toolPreviewImageMap[toolId] ||
    toolPreviewFallbacks[fallbackIndex % toolPreviewFallbacks.length]
  )
}

function resolveStageTools(tools: ToolMenuLinkItem[]): StageWithTools[] {
  const toolMap = new Map(tools.map((tool) => [tool.id, tool]))
  return stageDefinitions
    .map((stage) => ({
      ...stage,
      tools: stage.toolIds
        .map((toolId) => toolMap.get(toolId))
        .filter((tool): tool is ToolMenuLinkItem => Boolean(tool)),
    }))
    .filter((stage) => stage.tools.length > 0)
}

export default function ToolsPage() {
  const links = getFlatToolLinks()
  const stages = resolveStageTools(links)
  const spotlight = links.find((item) => item.id === "smart-doc") || links[0]
  const sidebarStages = stages.map((stage, index) => ({
    id: stage.id,
    title: stage.title,
    summary: stage.summary,
    order: index + 1,
    toolCount: stage.tools.length,
    toneClass: stageTheme.chip,
  }))

  return (
    <div
      style={toolsThemeStyle}
      className="mx-auto w-full max-w-[1520px] rounded-3xl bg-background p-1"
    >
      <section className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <ToolsStageFloatingRail stages={sidebarStages} />

        <div className="space-y-4">
          <ToolsHeroSpotlight
            spotlight={spotlight}
            previewSrc={getToolPreviewSrc(spotlight.id, 0)}
          />

          {stages.map((stage, stageIndex) => (
            <section
              key={stage.id}
              id={stage.id}
              aria-labelledby={`${stage.id}-title`}
              className="scroll-mt-24 rounded-2xl border border-border bg-card p-4 md:p-5"
            >
              <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
                      stageTheme.chip
                    )}
                  >
                    {stage.label}
                  </span>
                  <h2
                    id={`${stage.id}-title`}
                    className="font-heading text-2xl text-card-foreground"
                  >
                    {stage.title}
                  </h2>
                  <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                    {stage.summary}
                  </p>
                  <div className={cn("h-1 w-16 rounded-full", stageTheme.line)} />
                </div>
                <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                  {`${stage.tools.length} 个工具`}
                </span>
              </header>

              <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                {stage.tools.map((tool, toolIndex) => {
                  const group = getToolGroupByChildId(tool.id)
                  const previewSrc = getToolPreviewSrc(
                    tool.id,
                    stageIndex * 8 + toolIndex
                  )

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
                          sizes="(max-width: 640px) 100vw, (max-width: 1536px) 50vw, 33vw"
                          className="h-36 w-full object-cover contrast-[.95] saturate-[.82] transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
                        <div className="absolute inset-x-2 top-2 flex items-center justify-between gap-2">
                          <span className="inline-flex min-w-0 items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
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
                        立即使用
                        <ArrowRight className="size-3.5" />
                      </span>
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  )
}
