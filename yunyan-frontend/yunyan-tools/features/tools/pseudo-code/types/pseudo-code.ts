import type { WordCellAlignmentMode } from "@/features/tools/shared/types/word-export"

export type PseudoCodeMode = "ai" | "manual"

export type PseudoCodeTheme = "paper" | "contrast"
export type PseudoCodeImageExportFormat = "png" | "svg"

export interface PseudoCodeRenderConfig {
  showLineNumber: boolean
  hideEndKeywords: boolean
  lineNumberPunc: string
  indentSize: number
  titlePrefix: string
  titleCounter: number
  commentDelimiter: string
  theme: PseudoCodeTheme
}

export interface PseudoCodeStats {
  lineCount: number
  keywordCount: number
  commentCount: number
}

export interface PseudoCodeDocument {
  title: string
  algorithmName: string
  source: string
  normalizedLines: string[]
  renderConfig: PseudoCodeRenderConfig
  stats: PseudoCodeStats
}

export interface PseudoCodeGenerateRequest {
  mode: PseudoCodeMode
  aiPrompt?: string
  manualInput?: string
  algorithmName?: string
  renderConfig?: Partial<PseudoCodeRenderConfig>
}

export interface PseudoCodeGenerateResponse {
  document: PseudoCodeDocument
  source: "local" | "remote"
  message?: string
}

export interface PseudoCodeExportRequest {
  document: PseudoCodeDocument
  exportFormat?: PseudoCodeImageExportFormat
  fileName?: string
}

export interface PseudoCodeExportResult {
  blob: Blob
  fileName: string
  source: "local" | "remote"
  fileFormat?: PseudoCodeImageExportFormat
  message?: string
}

export interface PseudoCodeWordExportRequest {
  document: PseudoCodeDocument
  alignmentMode?: WordCellAlignmentMode
  fileName?: string
}

export interface PseudoCodeWordExportResult {
  blob: Blob
  fileName: string
  source: "local" | "remote"
  message?: string
}
