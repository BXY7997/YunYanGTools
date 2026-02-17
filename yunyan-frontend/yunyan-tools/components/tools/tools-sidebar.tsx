"use client"

/* eslint-disable tailwindcss/classnames-order */

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Wand2, X } from "lucide-react"

import type { ToolMenuGroupItem } from "@/types/tools"
import { getSortedRegistryItems } from "@/config/tools-registry"
import { cn } from "@/lib/utils"
import { ToolBadgeChip } from "@/components/tools/tool-badge"
import { ToolIcon } from "@/components/tools/tool-icon"

const GROUP_STORAGE_KEY = "tools.sidebar.groups.v1"
const registryItems = getSortedRegistryItems()
const registryGroups = registryItems.filter(
  (item): item is ToolMenuGroupItem => item.type === "group"
)

function createDefaultGroupState() {
  return registryGroups.reduce<Record<string, boolean>>((result, item) => {
    result[item.id] = true
    return result
  }, {})
}

interface ToolsSidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onMobileOpenChange: (nextValue: boolean) => void
}

export function ToolsSidebar({
  collapsed,
  mobileOpen,
  onMobileOpenChange,
}: ToolsSidebarProps) {
  const pathname = usePathname()
  const [expandedGroups, setExpandedGroups] = React.useState<
    Record<string, boolean>
  >(createDefaultGroupState)

  React.useEffect(() => {
    const rawState = window.localStorage.getItem(GROUP_STORAGE_KEY)
    if (!rawState) {
      return
    }
    try {
      const parsedState = JSON.parse(rawState) as Record<string, boolean>
      setExpandedGroups({
        ...createDefaultGroupState(),
        ...parsedState,
      })
    } catch {
      setExpandedGroups(createDefaultGroupState())
    }
  }, [])

  React.useEffect(() => {
    window.localStorage.setItem(
      GROUP_STORAGE_KEY,
      JSON.stringify(expandedGroups)
    )
  }, [expandedGroups])

  React.useEffect(() => {
    onMobileOpenChange(false)
  }, [onMobileOpenChange, pathname])

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-border bg-background/95 shadow-sm backdrop-blur transition-[width,transform] duration-200 ease-out motion-reduce:transition-none",
          collapsed ? "w-14" : "w-56",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div
          className={cn(
            "flex h-14 items-center border-b border-border",
            collapsed ? "justify-center px-1.5" : "justify-between px-3"
          )}
        >
          <Link
            href="/apps"
            className={cn(
              "group inline-flex items-center transition-colors",
              collapsed
                ? "size-7 justify-center rounded-md border border-border bg-background hover:bg-accent"
                : "h-11 w-full justify-start gap-2 rounded-md border border-border bg-card px-2 hover:bg-accent"
            )}
            aria-label="返回应用中心"
          >
            <span
              className={
                collapsed
                  ? "bg-primary/12 inline-flex size-5 items-center justify-center rounded-md border border-primary/25 text-primary"
                  : "bg-primary/12 inline-flex size-7 items-center justify-center rounded-md border border-primary/25 text-primary"
              }
            >
              <Wand2 className={cn(collapsed ? "size-2.5" : "size-4")} />
            </span>
            {!collapsed ? (
              <span className="truncate text-sm font-semibold tracking-wide text-foreground">
                YunYan Tools
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
            onClick={() => onMobileOpenChange(false)}
            aria-label="关闭导航栏"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="tools-scrollbar min-h-0 flex-1 overflow-y-auto px-2 py-3 [scrollbar-gutter:stable]">
          <nav className="space-y-1">
            {registryItems.map((item) => {
              if (item.type === "link") {
                const isActive = pathname === item.route
                return (
                  <Link
                    key={item.id}
                    href={item.route}
                    title={item.title}
                    className={cn(
                      "group flex h-9 items-center rounded-lg border px-2 text-xs font-medium transition-[background-color,border-color,color] duration-200",
                      collapsed
                        ? "mx-auto size-9 justify-center px-0"
                        : "justify-start gap-2",
                      isActive
                        ? "border-border bg-accent text-accent-foreground"
                        : "border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <ToolIcon name={item.icon} className="size-4 shrink-0" />
                    {!collapsed ? (
                      <>
                        <span className="min-w-0 truncate">{item.title}</span>
                        <span className="ml-auto shrink-0">
                          <ToolBadgeChip badge={item.badge} compact />
                        </span>
                      </>
                    ) : null}
                  </Link>
                )
              }

              const groupOpen = expandedGroups[item.id]

              return (
                <div key={item.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedGroups((previous) => ({
                        ...previous,
                        [item.id]: !previous[item.id],
                      }))
                    }
                    className={cn(
                      "flex h-9 items-center rounded-lg border px-2 text-xs font-medium transition-[background-color,border-color,color] duration-200",
                      collapsed
                        ? "mx-auto size-9 justify-center px-0"
                        : "w-full justify-start gap-2",
                      "border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-accent-foreground"
                    )}
                    title={item.title}
                    aria-expanded={groupOpen}
                  >
                    <ToolIcon name={item.icon} className="size-4 shrink-0" />
                    {!collapsed ? (
                      <>
                        <span className="truncate">{item.title}</span>
                        <ChevronDown
                          className={cn(
                            "ml-auto size-4 transition-transform duration-200",
                            groupOpen ? "rotate-180" : "rotate-0"
                          )}
                        />
                      </>
                    ) : null}
                  </button>

                  {groupOpen ? (
                    <div className={cn("space-y-1", collapsed ? "" : "pl-5")}>
                      {item.children
                        .slice()
                        .sort((first, second) => first.order - second.order)
                        .map((child) => {
                          const isActive = pathname === child.route
                          return (
                            <Link
                              key={child.id}
                              href={child.route}
                              title={child.title}
                              className={cn(
                                "group flex items-center rounded-lg border px-2 text-xs transition-[background-color,border-color,color] duration-200",
                                collapsed
                                  ? "mx-auto size-9 justify-center px-0"
                                  : "h-8 justify-start gap-2",
                                isActive
                                  ? "border-border bg-accent text-accent-foreground"
                                  : "border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              <ToolIcon
                                name={child.icon}
                                className={cn(
                                  "shrink-0",
                                  collapsed ? "size-4" : "size-3.5"
                                )}
                              />
                              {!collapsed ? (
                                <>
                                  <span className="min-w-0 truncate">
                                    {child.title}
                                  </span>
                                  <span className="ml-auto shrink-0">
                                    <ToolBadgeChip
                                      badge={child.badge}
                                      compact
                                    />
                                  </span>
                                </>
                              ) : null}
                            </Link>
                          )
                        })}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </nav>
        </div>

        <div className="border-t border-border p-2">
          <div className={cn("flex w-full", collapsed ? "justify-center px-0" : "justify-start")}>
            <button
              type="button"
              className={
                collapsed
                  ? /* eslint-disable tailwindcss/classnames-order */ "border border-border bg-card flex items-center justify-center rounded-md size-9" /* eslint-enable tailwindcss/classnames-order */
                  : "flex h-11 w-full items-center rounded-md border border-border bg-card px-2 text-left transition-colors hover:bg-accent justify-start gap-2"
              }
            >
              <span className="inline-flex size-8 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                U
              </span>
              {!collapsed ? (
                <span className="truncate text-xs leading-tight text-muted-foreground">
                  未登录用户
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => onMobileOpenChange(false)}
          aria-label="关闭导航遮罩"
        />
      ) : null}
    </>
  )
}
