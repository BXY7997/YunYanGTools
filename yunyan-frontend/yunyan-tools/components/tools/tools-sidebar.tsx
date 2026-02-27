"use client"

/* eslint-disable tailwindcss/classnames-order */

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, User, Wand2, X } from "lucide-react"

import type { ToolMenuGroupItem } from "@/types/tools"
import { getSortedRegistryItems } from "@/config/tools-registry"
import { cn } from "@/lib/utils"
import { ToolBadgeChip } from "@/components/tools/tool-badge"
import { ToolIcon } from "@/components/tools/tool-icon"
import { toolsLayoutTokens } from "@/features/tools/shared/constants/tools-layout-tokens"
import {
  LEGACY_SIDEBAR_GROUPS_STORAGE_KEYS,
  SIDEBAR_GROUPS_COOKIE_KEY,
  SIDEBAR_GROUPS_STORAGE_KEY,
  formatSidebarGroupsState,
  parseSidebarGroupsState,
} from "@/components/tools/sidebar-state"

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

function mergeGroupState(state?: Record<string, boolean> | null) {
  if (!state) {
    return createDefaultGroupState()
  }

  return {
    ...createDefaultGroupState(),
    ...state,
  }
}

interface ToolsSidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onMobileOpenChange: (nextValue: boolean) => void
  initialExpandedGroups?: Record<string, boolean> | null
  onCollapsedItemActivate: (itemId: string) => void
  pendingFocusItemId?: string | null
  onPendingFocusHandled?: () => void
}

export function ToolsSidebar({
  collapsed,
  mobileOpen,
  onMobileOpenChange,
  initialExpandedGroups,
  onCollapsedItemActivate,
  pendingFocusItemId,
  onPendingFocusHandled,
}: ToolsSidebarProps) {
  const pathname = usePathname()
  const navRef = React.useRef<HTMLElement | null>(null)
  const [highlightedItemId, setHighlightedItemId] = React.useState<
    string | null
  >(null)
  const [expandedGroups, setExpandedGroups] = React.useState(() =>
    mergeGroupState(initialExpandedGroups)
  )

  React.useLayoutEffect(() => {
    if (initialExpandedGroups) {
      return
    }

    const rawState = window.localStorage.getItem(SIDEBAR_GROUPS_STORAGE_KEY)
    if (rawState) {
      const parsedState = parseSidebarGroupsState(rawState)
      if (parsedState) {
        setExpandedGroups(mergeGroupState(parsedState))
        return
      }
    }

    for (const key of LEGACY_SIDEBAR_GROUPS_STORAGE_KEYS) {
      const legacyState = parseSidebarGroupsState(window.localStorage.getItem(key))
      if (legacyState) {
        setExpandedGroups(mergeGroupState(legacyState))
        return
      }
    }
  }, [initialExpandedGroups])

  React.useEffect(() => {
    const serializedState = formatSidebarGroupsState(expandedGroups)
    window.localStorage.setItem(SIDEBAR_GROUPS_STORAGE_KEY, serializedState)
    document.cookie = `${SIDEBAR_GROUPS_COOKIE_KEY}=${serializedState}; Path=/; Max-Age=31536000; SameSite=Lax`
  }, [expandedGroups])

  React.useEffect(() => {
    onMobileOpenChange(false)
  }, [onMobileOpenChange, pathname])

  React.useEffect(() => {
    if (collapsed || !pendingFocusItemId) {
      return
    }

    const target = navRef.current?.querySelector<HTMLElement>(
      `[data-sidebar-item-id="${pendingFocusItemId}"]`
    )

    if (target) {
      target.scrollIntoView({ block: "nearest" })
      target.focus()
      setHighlightedItemId(pendingFocusItemId)
      const timer = window.setTimeout(() => {
        setHighlightedItemId((previous) =>
          previous === pendingFocusItemId ? null : previous
        )
      }, 760)
      onPendingFocusHandled?.()
      return () => window.clearTimeout(timer)
    }

    onPendingFocusHandled?.()
  }, [collapsed, onPendingFocusHandled, pendingFocusItemId])

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-border bg-background/95 shadow-sm backdrop-blur transition-[width,transform] ease-out motion-reduce:transition-none",
          toolsLayoutTokens.sidebar.transitionDurationClass,
          collapsed
            ? toolsLayoutTokens.sidebar.collapsedWidthClass
            : toolsLayoutTokens.sidebar.expandedWidthClass,
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div
          className={cn(
            "flex items-center border-b border-border/80",
            toolsLayoutTokens.sidebar.brandHeightClass,
            collapsed ? "justify-center px-1.5" : "justify-between px-2.5"
          )}
        >
          <Link
            href="/apps"
            className={cn(
              "group inline-flex items-center transition-colors",
              collapsed
                ? "mx-auto size-8 justify-center rounded-md bg-muted/35 text-primary hover:bg-muted/60"
                : "h-9 w-full justify-start gap-2 rounded-md bg-muted/35 px-2 hover:bg-muted/60"
            )}
            aria-label="返回应用中心"
          >
            {collapsed ? (
              <Wand2 className={toolsLayoutTokens.sidebar.navIconClass} />
            ) : (
              <span className="bg-primary/12 inline-flex size-6 items-center justify-center rounded-md text-primary">
                <Wand2 className={toolsLayoutTokens.sidebar.navIconClass} />
              </span>
            )}
            {!collapsed ? (
              <span className="truncate text-xs font-semibold tracking-[0.02em] text-foreground">
                YunYan Tools
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
            onClick={() => onMobileOpenChange(false)}
            aria-label="关闭导航栏"
          >
            <X className="size-4" />
          </button>
        </div>

        <div
          className={cn(
            "min-h-0 flex-1 px-1.5",
            collapsed
              ? "overflow-y-hidden overscroll-y-none py-2.5"
              : "tools-scrollbar overflow-y-auto overscroll-y-contain py-2 [scrollbar-gutter:stable]"
          )}
        >
          <nav ref={navRef} className="space-y-0.5">
            {registryItems.map((item) => {
              if (item.type === "link") {
                const isActive = pathname === item.route
                const collapsedClassName = cn(
                  "mx-auto size-8 justify-center px-0 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  isActive && "bg-accent/90 text-foreground",
                  highlightedItemId === item.id && "ring-1 ring-primary/35"
                )

                if (collapsed) {
                  return (
                    <button
                      key={item.id}
                      type="button"
                      title={item.title}
                      data-sidebar-item-id={item.id}
                      className={cn(
                        "group relative flex items-center rounded-md text-[12px] font-medium transition-colors ease-out",
                        toolsLayoutTokens.sidebar.transitionDurationClass,
                        collapsedClassName
                      )}
                      onClick={() => onCollapsedItemActivate(item.id)}
                    >
                      <ToolIcon
                        name={item.icon}
                        className={cn(
                          "shrink-0",
                          toolsLayoutTokens.sidebar.navIconClass
                        )}
                      />
                    </button>
                  )
                }

                return (
                  <Link
                    key={item.id}
                    href={item.route}
                    title={item.title}
                    data-sidebar-item-id={item.id}
                    className={cn(
                      "group relative flex items-center rounded-md text-[12px] font-medium transition-colors ease-out",
                      toolsLayoutTokens.sidebar.transitionDurationClass,
                      "justify-start gap-2 px-2",
                      toolsLayoutTokens.sidebar.navItemHeightClass,
                      "before:absolute before:left-0 before:top-1/2 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full",
                      isActive
                        ? "bg-accent/90 text-foreground before:bg-primary"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground before:bg-transparent hover:before:bg-border",
                      highlightedItemId === item.id && "ring-1 ring-primary/35"
                    )}
                  >
                    <ToolIcon
                      name={item.icon}
                      className={cn(
                        "shrink-0",
                        toolsLayoutTokens.sidebar.navIconClass
                      )}
                    />
                    {!collapsed ? (
                      <>
                        <span className="min-w-0 truncate pr-1">{item.title}</span>
                        <span
                          className={cn(
                            "ml-auto shrink-0",
                            isActive ? "inline-flex" : "hidden group-hover:inline-flex"
                          )}
                        >
                          <ToolBadgeChip badge={item.badge} compact />
                        </span>
                      </>
                    ) : null}
                  </Link>
                )
              }

              const groupOpen = expandedGroups[item.id]
              const groupHasActiveChild = item.children.some(
                (child) => pathname === child.route
              )

              return (
                <div key={item.id} className="space-y-0.5 pt-0.5 first:pt-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (collapsed) {
                        onCollapsedItemActivate(item.id)
                        return
                      }
                      setExpandedGroups((previous) => ({
                        ...previous,
                        [item.id]: !previous[item.id],
                      }))
                    }}
                    data-sidebar-item-id={item.id}
                    className={cn(
                      "group relative flex items-center rounded-md text-[11px] font-semibold transition-colors ease-out",
                      toolsLayoutTokens.sidebar.transitionDurationClass,
                      collapsed
                        ? "mx-auto size-8 justify-center px-0"
                        : "w-full justify-start gap-2 px-2",
                      !collapsed && toolsLayoutTokens.sidebar.navItemHeightClass,
                      !collapsed &&
                        "before:absolute before:left-0 before:top-1/2 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full",
                      groupHasActiveChild
                        ? "bg-accent/80 text-foreground before:bg-primary"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground before:bg-transparent hover:before:bg-border",
                      highlightedItemId === item.id && "ring-1 ring-primary/35"
                    )}
                    title={item.title}
                    aria-expanded={groupOpen}
                  >
                    <ToolIcon
                      name={item.icon}
                      className={cn(
                        "shrink-0",
                        toolsLayoutTokens.sidebar.navIconClass
                      )}
                    />
                    {!collapsed ? (
                      <>
                        <span className="truncate pr-1">{item.title}</span>
                        <ChevronDown
                          className={cn(
                            "ml-auto size-3.5 transition-transform ease-out",
                            toolsLayoutTokens.sidebar.transitionDurationClass,
                            groupOpen ? "rotate-180" : "rotate-0"
                          )}
                        />
                      </>
                    ) : null}
                  </button>

                  {groupOpen && !collapsed ? (
                    <div className="space-y-0.5 pl-3">
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
                                "group relative flex items-center rounded-md text-[11px] transition-colors ease-out",
                                toolsLayoutTokens.sidebar.transitionDurationClass,
                                "justify-start gap-2 px-2",
                                toolsLayoutTokens.sidebar.navSubItemHeightClass,
                                "before:absolute before:left-0 before:top-1/2 before:h-3.5 before:w-0.5 before:-translate-y-1/2 before:rounded-full",
                                isActive
                                  ? "bg-accent/80 text-foreground before:bg-primary"
                                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground before:bg-transparent hover:before:bg-border"
                              )}
                            >
                              <ToolIcon
                                name={child.icon}
                                className={cn(
                                  "shrink-0",
                                  toolsLayoutTokens.sidebar.navSubIconClass
                                )}
                              />
                              <span className="min-w-0 truncate">{child.title}</span>
                              <span
                                className={cn(
                                  "ml-auto shrink-0",
                                  isActive
                                    ? "inline-flex"
                                    : "hidden group-hover:inline-flex"
                                )}
                              >
                                <ToolBadgeChip badge={child.badge} compact />
                              </span>
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

        <div className="border-t border-border/80 p-1.5">
          <div
            className={cn(
              "flex w-full",
              collapsed ? "justify-center px-0" : "justify-start"
            )}
          >
            <button
              type="button"
              className={
                collapsed
                  ? "mx-auto inline-flex size-8 items-center justify-center rounded-md bg-muted/35 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                  : "flex h-8 w-full items-center rounded-md bg-muted/35 px-2 text-left transition-colors hover:bg-muted/60 justify-start gap-2"
              }
            >
              {collapsed ? (
                <User className={toolsLayoutTokens.sidebar.navIconClass} />
              ) : (
                <>
                  <span className="inline-flex size-6 items-center justify-center rounded-md bg-background text-[11px] font-semibold text-muted-foreground">
                    U
                  </span>
                  <span className="truncate text-[11px] leading-tight text-muted-foreground">
                    访客模式
                  </span>
                </>
              )}
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
