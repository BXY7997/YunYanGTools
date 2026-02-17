import { cookies } from "next/headers"

import {
  SIDEBAR_COOKIE_KEY,
  parseSidebarCollapsedState,
} from "@/components/tools/sidebar-state"
import { ToolsShell } from "@/components/tools/tools-shell"

interface ToolsLayoutProps {
  children: React.ReactNode
}

export default function ToolsLayout({ children }: ToolsLayoutProps) {
  const cookieStore = cookies()
  const cookieState = parseSidebarCollapsedState(
    cookieStore.get(SIDEBAR_COOKIE_KEY)?.value
  )
  const initialCollapsed = cookieState ?? true

  return <ToolsShell initialCollapsed={initialCollapsed}>{children}</ToolsShell>
}
