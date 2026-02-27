"use client"

import { DiagramWorkspace } from "@/features/tools/shared/diagram"
import { softwareEngineeringPreset } from "@/features/tools/software-engineering/constants/software-engineering-config"
import type { ToolMenuLinkItem } from "@/types/tools"

interface SoftwareEngineeringWorkspaceProps {
  tool: ToolMenuLinkItem
  groupTitle?: string
}

export function SoftwareEngineeringWorkspace({
  tool,
  groupTitle,
}: SoftwareEngineeringWorkspaceProps) {
  return <DiagramWorkspace tool={tool} groupTitle={groupTitle} preset={softwareEngineeringPreset} />
}
