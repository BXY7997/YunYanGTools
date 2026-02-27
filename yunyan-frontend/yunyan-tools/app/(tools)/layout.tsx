import { cookies } from "next/headers"

import {
  SIDEBAR_GROUPS_COOKIE_KEY,
  SIDEBAR_COOKIE_KEY,
  parseSidebarGroupsState,
  parseSidebarCollapsedState,
} from "@/components/tools/sidebar-state"
import { ToolsShell } from "@/components/tools/tools-shell"

interface ToolsLayoutProps {
  children: React.ReactNode
}

export default async function ToolsLayout({ children }: ToolsLayoutProps) {
  const cookieStore = await cookies()
  const cookieState = parseSidebarCollapsedState(
    cookieStore.get(SIDEBAR_COOKIE_KEY)?.value
  )
  const groupCookieState = parseSidebarGroupsState(
    cookieStore.get(SIDEBAR_GROUPS_COOKIE_KEY)?.value
  )
  const initialCollapsed = cookieState ?? true

  return (
    <ToolsShell
      initialCollapsed={initialCollapsed}
      initialExpandedGroups={groupCookieState}
    >
      {children}
    </ToolsShell>
  )
}
