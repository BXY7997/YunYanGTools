import type { DiagramToolId } from "@/features/tools/shared/diagram/types/diagram"

export interface DiagramApiContractItem {
  toolId: DiagramToolId
  generatePath: string
  exportPath: string
  supportsRealtimeSync: boolean
}

export const diagramApiContracts: Record<DiagramToolId, DiagramApiContractItem> = {
  "er-diagram": {
    toolId: "er-diagram",
    generatePath: "/api/tools/er-diagram/generate",
    exportPath: "/api/tools/er-diagram/export",
    supportsRealtimeSync: true,
  },
  "feature-structure": {
    toolId: "feature-structure",
    generatePath: "/api/tools/feature-structure/generate",
    exportPath: "/api/tools/feature-structure/export",
    supportsRealtimeSync: true,
  },
  "software-engineering": {
    toolId: "software-engineering",
    generatePath: "/api/tools/software-engineering/generate",
    exportPath: "/api/tools/software-engineering/export",
    supportsRealtimeSync: true,
  },
  "architecture-diagram": {
    toolId: "architecture-diagram",
    generatePath: "/api/tools/architecture-diagram/generate",
    exportPath: "/api/tools/architecture-diagram/export",
    supportsRealtimeSync: true,
  },
  "mind-map": {
    toolId: "mind-map",
    generatePath: "/api/tools/mind-map/generate",
    exportPath: "/api/tools/mind-map/export",
    supportsRealtimeSync: true,
  },
}
