import type { DiagramDocument, DiagramRenderConfig } from "@/features/tools/shared/diagram/types/diagram"

export type FeatureStructureDocument = DiagramDocument

export interface FeatureStructureViewport {
  zoom: number
  offsetX: number
  offsetY: number
}

export interface FeatureStructureLayoutOptions {
  nodeWidth?: number
  singleCharPerLine?: boolean
  avoidCrossing?: boolean
}

export interface FeatureStructureGenerationRequest {
  prompt: string
  mode: "ai" | "manual"
  renderConfig: Omit<DiagramRenderConfig, "zoom">
  layoutOptions?: FeatureStructureLayoutOptions
}

export interface FeatureStructureGenerationResponse {
  source: "local" | "remote"
  document: FeatureStructureDocument
  message?: string
}

export type FeatureStructureWorkspaceFieldValues = Record<string, string | number | boolean>

export interface FeatureStructureSyncRequest {
  toolId: string
  prompt: string
  mode: "ai" | "manual"
  fieldValues: FeatureStructureWorkspaceFieldValues
  viewport: FeatureStructureViewport
  document: FeatureStructureDocument
  syncedAt: string
}

export interface FeatureStructureSyncResult {
  source: "local" | "remote"
  message: string
  syncId: string
  syncedAt: string
}

export interface FeatureStructureApiContract {
  generatePath: string
  exportPath: string
  syncPath: string
}
