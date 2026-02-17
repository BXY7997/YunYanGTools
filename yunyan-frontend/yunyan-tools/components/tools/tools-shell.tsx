"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { ChevronRight, Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  LEGACY_SIDEBAR_STORAGE_KEYS,
  SIDEBAR_COOKIE_KEY,
  SIDEBAR_STORAGE_KEY,
  formatSidebarCollapsedState,
  parseSidebarCollapsedState,
} from "@/components/tools/sidebar-state"
import { ToolsCommandMenu } from "@/components/tools/tools-command-menu"
import { ToolsSidebar } from "@/components/tools/tools-sidebar"

interface ToolsShellProps {
  children: React.ReactNode
  initialCollapsed: boolean
}

export function ToolsShell({ children, initialCollapsed }: ToolsShellProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(initialCollapsed)
  const [sidebarStateReady, setSidebarStateReady] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  React.useLayoutEffect(() => {
    try {
      const persistedState = parseSidebarCollapsedState(
        window.localStorage.getItem(SIDEBAR_STORAGE_KEY)
      )

      if (persistedState != null) {
        setCollapsed(persistedState)
        return
      }

      for (const key of LEGACY_SIDEBAR_STORAGE_KEYS) {
        const legacyState = parseSidebarCollapsedState(
          window.localStorage.getItem(key)
        )
        if (legacyState != null) {
          setCollapsed(legacyState)
          break
        }
      }
    } catch {
      setCollapsed(initialCollapsed)
    } finally {
      setSidebarStateReady(true)
    }
  }, [initialCollapsed])

  React.useEffect(() => {
    if (!sidebarStateReady) {
      return
    }

    const serializedState = formatSidebarCollapsedState(collapsed)

    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, serializedState)
    } catch {
      // Ignore storage write failures (private mode / quota exceeded).
    }

    try {
      document.cookie = `${SIDEBAR_COOKIE_KEY}=${serializedState}; Path=/; Max-Age=31536000; SameSite=Lax`
    } catch {
      // Ignore cookie write failures.
    }
  }, [collapsed, sidebarStateReady])

  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ToolsSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />
      <div
        className={cn(
          "min-h-screen transition-[padding-left] duration-200 ease-out motion-reduce:transition-none",
          collapsed ? "md:pl-14" : "md:pl-56"
        )}
      >
        <header className="sticky top-0 z-20 bg-background/95 backdrop-blur">
          <div className="flex h-14 items-center gap-3 border-b border-border/80 px-3 md:px-4">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
              aria-label="打开导航栏"
            >
              <Menu className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="hidden size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-[0.98] md:inline-flex"
              aria-label={collapsed ? "展开侧边栏" : "折叠侧边栏"}
            >
              <ChevronRight
                className={cn(
                  "size-3.5 transition-transform duration-200 ease-out motion-reduce:transition-none",
                  collapsed ? "rotate-0" : "rotate-180"
                )}
              />
            </button>
            <p className="hidden text-xs tracking-[0.2em] text-muted-foreground md:block">
              CAMPUS TOOL WORKSPACE
            </p>
            <ToolsCommandMenu className="ml-auto max-w-xl" />
          </div>
        </header>
        <main className="p-3 md:p-4">{children}</main>
      </div>
    </div>
  )
}
