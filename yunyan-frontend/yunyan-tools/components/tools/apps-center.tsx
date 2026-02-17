import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { getAppsCollections, toolLinks } from "@/config/tools-registry"
import { ToolBadgeChip } from "@/components/tools/tool-badge"
import { ToolIcon } from "@/components/tools/tool-icon"

export function AppsCenter() {
  const collections = getAppsCollections()
  const cardItems = collections.flatMap((collection) => collection.items)
  const hotCount = cardItems.filter((item) => item.badge === "hot").length
  const newCount = cardItems.filter(
    (item) => item.badge === "new" || item.badge === "newProduct"
  ).length
  const totalCount = toolLinks.filter((item) =>
    item.route.startsWith("/apps/")
  ).length

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              APPS CENTER
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-card-foreground md:text-4xl">
              应用中心
            </h1>
            <p className="text-sm leading-7 text-muted-foreground md:text-base">
              这里还原了 `tools.anqstar.com/apps`
              的核心结构，并升级为配置驱动架构：
              统一侧栏、统一工作区壳子、统一搜索入口，新增工具只需改注册表。
            </p>
          </div>
          <div className="grid gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground sm:grid-cols-3 sm:gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Tool Total
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {totalCount}
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

      {collections.map((collection) => (
        <section
          key={collection.id}
          className="rounded-xl border border-border bg-card p-4 md:p-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-card-foreground">
              {collection.title}
            </h2>
            <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              {collection.items.length} 项
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {collection.items.map((item) => (
              <Link
                key={item.id}
                href={item.route}
                className="group flex h-full flex-col rounded-lg border border-border bg-background p-3 transition-colors hover:bg-accent/50"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    <ToolIcon name={item.icon} className="h-5 w-5" />
                  </span>
                  <ToolBadgeChip badge={item.badge} />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 flex-1 text-xs leading-6 text-muted-foreground">
                  {item.summary}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(item.tags || []).slice(0, 3).map((tag) => (
                    <span
                      key={`${item.id}-${tag}`}
                      className="rounded-full border border-border bg-muted px-2 py-1 text-[11px] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-foreground">
                  立即体验
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
