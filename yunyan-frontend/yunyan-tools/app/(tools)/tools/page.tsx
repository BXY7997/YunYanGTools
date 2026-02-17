import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { getSortedRegistryItems } from "@/config/tools-registry"
import { ToolBadgeChip } from "@/components/tools/tool-badge"
import { ToolIcon } from "@/components/tools/tool-icon"

export const metadata = {
  title: "工具导航",
  description: "按统一信息架构浏览工具与工作区类型。",
}

export default function ToolsPage() {
  const items = getSortedRegistryItems()

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          TOOL NAVIGATION
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-card-foreground">
          工具导航
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
          本页展示了 TASK.md 约定的统一信息架构。每个菜单项都来自同一份
          `tools-registry`，并通过 `workspaceType` 控制渲染壳子类型。
        </p>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        {items.map((item) => {
          if (item.type === "link") {
            return (
              <Link
                key={item.id}
                href={item.route}
                className="group rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <ToolIcon name={item.icon} className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-foreground">
                        {item.title}
                      </h2>
                      <ToolBadgeChip badge={item.badge} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.summary}
                    </p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            )
          }

          return (
            <article
              key={item.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <ToolIcon name={item.icon} className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {item.title}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {item.children.length} 个子工具
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                {item.children
                  .slice()
                  .sort((first, second) => first.order - second.order)
                  .map((child) => (
                    <Link
                      key={child.id}
                      href={child.route}
                      className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-accent-foreground"
                    >
                      <ToolIcon name={child.icon} className="h-3.5 w-3.5" />
                      <span className="truncate">{child.title}</span>
                      <span className="ml-auto">
                        <ToolBadgeChip badge={child.badge} />
                      </span>
                    </Link>
                  ))}
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}
