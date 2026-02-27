import type { DiagramRenderConfig } from "@/features/tools/shared/diagram/types/diagram"
import type { FeatureStructureViewport } from "@/features/tools/feature-structure/types/feature-structure"

export function createFeatureStructureViewport(): FeatureStructureViewport {
  return {
    zoom: 100,
    offsetX: 0,
    offsetY: 0,
  }
}

export function createFeatureStructureRenderConfig(): DiagramRenderConfig {
  return {
    zoom: 100,
    nodeRadius: 10,
    nodeGapX: 128,
    nodeGapY: 78,
    fontSize: 14,
    lineStyle: "curve",
    showShadow: true,
    compactRows: false,
  }
}
