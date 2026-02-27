import * as React from "react"

import { toolsWorkspaceLayout } from "@/features/tools/shared/constants/workspace-layout"
import { cn } from "@/lib/utils"

interface ToolWorkspaceShellProps {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  showRightGrid?: boolean
}

export function ToolWorkspaceShell({
  children,
  className,
  contentClassName,
  showRightGrid = true,
}: ToolWorkspaceShellProps) {
  return (
    <div
      data-tools-workspace-main
      className={cn(
        toolsWorkspaceLayout.main,
        "tools-workspace-stage",
        showRightGrid && "tools-workspace-right-grid",
        className
      )}
    >
      <div className={cn(toolsWorkspaceLayout.container, contentClassName)}>
        {children}
      </div>
    </div>
  )
}
