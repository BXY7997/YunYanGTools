"use client"

import { DiagramWorkspace } from "@/features/tools/shared/diagram"
import { architectureDiagramPreset } from "@/features/tools/architecture-diagram/constants/architecture-diagram-config"
import type { ToolMenuLinkItem } from "@/types/tools"

interface ArchitectureDiagramWorkspaceProps {
  tool: ToolMenuLinkItem
  groupTitle?: string
}

export function ArchitectureDiagramWorkspace({
  tool,
  groupTitle,
}: ArchitectureDiagramWorkspaceProps) {
  return <DiagramWorkspace tool={tool} groupTitle={groupTitle} preset={architectureDiagramPreset} />
}
