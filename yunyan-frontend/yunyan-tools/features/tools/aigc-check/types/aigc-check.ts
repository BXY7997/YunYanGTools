import type {
  WordCellAlignmentMode,
  WordExportPresetId,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"

export type AigcCheckMode = "file" | "text"

export type AigcRiskLevel = "low" | "medium" | "high"

export interface AigcSentenceRiskItem {
  id: string
  text: string
  aiProbability: number
  level: AigcRiskLevel
  signals: string[]
}

export interface AigcCheckResult {
  title: string
  aiProbability: number
  humanProbability: number
  confidence: number
  wordCount: number
  summary: string
  suggestions: string[]
  sentenceRisks: AigcSentenceRiskItem[]
}

export interface AigcCheckGenerateRequest {
  mode: AigcCheckMode
  title?: string
  content?: string
  file?: File
}

export interface AigcCheckGenerateResponse {
  result: AigcCheckResult
  source: "local" | "remote"
  message?: string
}

export interface AigcCheckExportRequest {
  result: AigcCheckResult
  orientationMode?: WordPageOrientationMode
  alignmentMode?: WordCellAlignmentMode
  presetId?: WordExportPresetId
}

export interface AigcCheckExportResult {
  blob: Blob
  fileName: string
  source: "local" | "remote"
  fileFormat?: "doc"
  message?: string
}
