import { getWorkspaceConfigForTool } from "@/config/tools-registry"
import { resolveDiagramPreset } from "@/features/tools/shared/diagram/constants/diagram-tool-presets"
import type { ToolMenuLinkItem } from "@/types/tools"

export const featureStructurePreset = resolveDiagramPreset("feature-structure")

export function getFeatureStructureWorkspaceConfig(tool: ToolMenuLinkItem) {
  return getWorkspaceConfigForTool(tool)
}

export function getFeatureStructureWorkspaceConfigById(toolId: string) {
  return getWorkspaceConfigForTool({
    id: toolId,
    workspaceType: "canvas",
  } as ToolMenuLinkItem)
}
