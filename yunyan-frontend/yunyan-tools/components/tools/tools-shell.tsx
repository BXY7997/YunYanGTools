"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  ChevronRight,
  Coins,
  Gem,
  Menu,
  User,
  Wallet,
} from "lucide-react"

import type { ToolBadge } from "@/types/tools"
import { cn } from "@/lib/utils"
import { ToolBadgeChip } from "@/components/tools/tool-badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

interface WorkspaceQuickMenuItem {
  id: string
  title: string
  route: string
  icon: React.ComponentType<{ className?: string }>
}

const workspaceQuickMenus: WorkspaceQuickMenuItem[] = [
  {
    id: "wallet",
    title: "金币",
    icon: Coins,
    route: "/apps/wallet",
  },
  {
    id: "member",
    title: "会员",
    icon: Gem,
    route: "/apps/member",
  },
  {
    id: "profile",
    title: "个人中心",
    icon: User,
    route: "/apps/profile",
  },
]

export interface WorkspaceHeaderStatus {
  breadcrumbs: string[]
  badge?: ToolBadge
  savedText: string
  savedAtLabel: string
  saveModeLabel?: string
}

interface WorkspaceHeaderStatusContextValue {
  setWorkspaceHeaderStatus: (status: WorkspaceHeaderStatus | null) => void
}

const WorkspaceHeaderStatusContext =
  React.createContext<WorkspaceHeaderStatusContextValue | null>(null)

export function useWorkspaceHeaderStatus() {
  const context = React.useContext(WorkspaceHeaderStatusContext)
  if (!context) {
    throw new Error(
      "useWorkspaceHeaderStatus 必须在 <ToolsShell> 组件内部使用。"
    )
  }
  return context
}

function WorkspaceQuickMenus() {
  const mobileMenuItems: WorkspaceQuickMenuItem[] = [
    ...workspaceQuickMenus,
    {
      id: "wallet-record",
      title: "消费记录",
      route: "/apps/wallet",
      icon: Wallet,
    },
  ]

  return (
    <div className="flex items-center gap-1">
      <nav
        className="hidden items-center gap-1 md:flex"
        aria-label="桌面顶部快捷菜单"
      >
        {workspaceQuickMenus.map((menu) => {
          const MenuIcon = menu.icon
          return (
            <DropdownMenu key={menu.id}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-background px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  aria-label={menu.title}
                  title={menu.title}
                >
                  <MenuIcon className="size-3.5" />
                  <span>{menu.title}</span>
                  <ChevronDown className="size-3 text-muted-foreground/80" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 border-border">
                <DropdownMenuItem asChild>
                  <Link href={menu.route} className="cursor-pointer gap-2">
                    <MenuIcon className="size-4 text-muted-foreground" />
                    <span>{`进入${menu.title}`}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        })}
      </nav>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
            aria-label="账户菜单"
          >
            <User className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 border-border">
          {mobileMenuItems.map((menu, index) => {
            const MenuIcon = menu.icon
            return (
              <React.Fragment key={menu.id}>
                {index > 0 ? <DropdownMenuSeparator /> : null}
                <DropdownMenuItem asChild>
                  <Link href={menu.route} className="cursor-pointer gap-2">
                    <MenuIcon className="size-4 text-muted-foreground" />
                    <span>{menu.title}</span>
                  </Link>
                </DropdownMenuItem>
              </React.Fragment>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function ToolsShell({ children, initialCollapsed }: ToolsShellProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(initialCollapsed)
  const [sidebarStateReady, setSidebarStateReady] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [workspaceHeaderStatus, setWorkspaceHeaderStatus] =
    React.useState<WorkspaceHeaderStatus | null>(null)

  const contextValue = React.useMemo(
    () => ({
      setWorkspaceHeaderStatus,
    }),
    []
  )

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
    <WorkspaceHeaderStatusContext.Provider value={contextValue}>
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
              {workspaceHeaderStatus ? (
                <div className="hidden min-w-0 flex-1 items-center gap-2 xl:flex">
                  <div className="inline-flex min-w-0 items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
                    {workspaceHeaderStatus.breadcrumbs.map(
                      (breadcrumb, index) => (
                        <React.Fragment
                          key={`${breadcrumb}-${index.toString()}`}
                        >
                          {index > 0 ? <span>›</span> : null}
                          <span
                            className={cn(
                              "max-w-56 truncate",
                              index ===
                                workspaceHeaderStatus.breadcrumbs.length - 1 &&
                                "font-medium text-foreground"
                            )}
                            title={breadcrumb}
                          >
                            {breadcrumb}
                          </span>
                        </React.Fragment>
                      )
                    )}
                    <ToolBadgeChip badge={workspaceHeaderStatus.badge} />
                  </div>
                  <span className="rounded-full border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground">
                    {workspaceHeaderStatus.saveModeLabel || "本地存储"}
                  </span>
                  <span className="hidden rounded-full border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground xl:inline">
                    上次保存 {workspaceHeaderStatus.savedAtLabel}
                  </span>
                  <span className="rounded-full border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground">
                    {workspaceHeaderStatus.savedText}
                  </span>
                </div>
              ) : null}
              <div className="ml-auto flex min-w-0 items-center justify-end gap-1.5">
                <ToolsCommandMenu className="size-9 justify-center px-0 sm:h-9 sm:w-40 sm:justify-start sm:px-2.5 md:w-44 lg:w-52 [&>kbd]:hidden [&>span]:hidden sm:[&>span]:inline" />
                <WorkspaceQuickMenus />
              </div>
            </div>
          </header>
          <main className="overflow-x-clip p-3 md:p-4">{children}</main>
        </div>
      </div>
    </WorkspaceHeaderStatusContext.Provider>
  )
}
