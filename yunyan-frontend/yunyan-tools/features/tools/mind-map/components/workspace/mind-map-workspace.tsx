"use client"

import { DiagramWorkspace } from "@/features/tools/shared/diagram"
import { mindMapPreset } from "@/features/tools/mind-map/constants/mind-map-config"
import type { ToolMenuLinkItem } from "@/types/tools"

interface MindMapWorkspaceProps {
  tool: ToolMenuLinkItem
  groupTitle?: string
}

export function MindMapWorkspace({ tool, groupTitle }: MindMapWorkspaceProps) {
  return <DiagramWorkspace tool={tool} groupTitle={groupTitle} preset={mindMapPreset} />
}
