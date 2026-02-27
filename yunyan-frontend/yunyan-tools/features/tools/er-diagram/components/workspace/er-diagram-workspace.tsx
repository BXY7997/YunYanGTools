"use client"

import { DiagramWorkspace } from "@/features/tools/shared/diagram"
import { erDiagramPreset } from "@/features/tools/er-diagram/constants/er-diagram-config"
import type { ToolMenuLinkItem } from "@/types/tools"

interface ErDiagramWorkspaceProps {
  tool: ToolMenuLinkItem
  groupTitle?: string
}

export function ErDiagramWorkspace({ tool, groupTitle }: ErDiagramWorkspaceProps) {
  return <DiagramWorkspace tool={tool} groupTitle={groupTitle} preset={erDiagramPreset} />
}
