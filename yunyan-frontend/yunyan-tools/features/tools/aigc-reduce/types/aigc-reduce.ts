import type {
  WordCellAlignmentMode,
  WordExportPresetId,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"

export type AigcReduceMode = "file" | "text"

export type AigcReduceSplitMode = "paragraph" | "sentence"

export interface AigcReduceResult {
  title: string
  splitMode: AigcReduceSplitMode
  originalText: string
  optimizedText: string
  beforeProbability: number
  afterProbability: number
  confidence: number
  rewriteCount: number
  notes: string[]
}

export interface AigcReduceGenerateRequest {
  mode: AigcReduceMode
  splitMode: AigcReduceSplitMode
  title?: string
  content?: string
  file?: File
}

export interface AigcReduceGenerateResponse {
  result: AigcReduceResult
  source: "local" | "remote"
  message?: string
}

export interface AigcReduceExportRequest {
  result: AigcReduceResult
  orientationMode?: WordPageOrientationMode
  alignmentMode?: WordCellAlignmentMode
  presetId?: WordExportPresetId
}

export interface AigcReduceExportResult {
  blob: Blob
  fileName: string
  source: "local" | "remote"
  fileFormat?: "doc"
  message?: string
}
