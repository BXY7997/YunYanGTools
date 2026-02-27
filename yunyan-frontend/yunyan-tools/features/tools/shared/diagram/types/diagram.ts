export type DiagramToolId =
  | "er-diagram"
  | "feature-structure"
  | "software-engineering"
  | "architecture-diagram"
  | "mind-map"

export type DiagramInputMode = "ai" | "manual"
export type DiagramParserKind = "er" | "hierarchy" | "flow" | "mind"

export type DiagramNodeKind =
  | "entity"
  | "module"
  | "service"
  | "topic"
  | "leaf"

export interface DiagramNode {
  id: string
  label: string
  kind: DiagramNodeKind
  x: number
  y: number
  width: number
  height: number
  fields?: string[]
  level?: number
}

export interface DiagramEdge {
  id: string
  source: string
  target: string
  label?: string
  type?: "solid" | "dashed"
}

export interface DiagramDocument {
  title: string
  parserKind: DiagramParserKind
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  width: number
  height: number
  generatedAt: string
}

export interface DiagramRenderConfig {
  zoom: number
  nodeRadius: number
  nodeGapX: number
  nodeGapY: number
  fontSize: number
  lineStyle: "curve" | "orthogonal"
  showShadow: boolean
  compactRows: boolean
}

export interface DiagramPresetChip {
  label: string
  value: string
}

export interface DiagramToolPreset {
  toolId: DiagramToolId
  title: string
  subtitle: string
  parserKind: DiagramParserKind
  aiPlaceholder: string
  manualPlaceholder: string
  defaultInput: string
  chips: DiagramPresetChip[]
  surfaceTone: "sky" | "emerald" | "amber" | "violet" | "slate"
}

export interface DiagramGenerateRequest {
  toolId: DiagramToolId
  input: string
  mode: DiagramInputMode
  config: Omit<DiagramRenderConfig, "zoom">
}

export interface DiagramGenerateResponse {
  source: "local" | "remote"
  document: DiagramDocument
  message?: string
}

export type DiagramExportFormat = "svg" | "png"

export interface DiagramExportRequest {
  document: DiagramDocument
  format: DiagramExportFormat
  fileName: string
  config: Omit<DiagramRenderConfig, "zoom">
}

export interface DiagramSyncRequest {
  toolId: DiagramToolId
  input: string
  mode: DiagramInputMode
  config: Omit<DiagramRenderConfig, "zoom">
  document: DiagramDocument
  syncedAt: string
}

export interface DiagramSyncResult {
  source: "local" | "remote"
  syncedAt: string
  message: string
  syncId?: string
}
