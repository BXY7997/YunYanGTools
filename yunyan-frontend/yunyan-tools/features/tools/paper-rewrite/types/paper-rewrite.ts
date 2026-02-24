import type {
  WordCellAlignmentMode,
  WordExportPresetId,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"

export type PaperRewriteMode = "file" | "text"

export type PaperRewriteSplitMode = "paragraph" | "sentence"

export interface PaperRewriteResult {
  title: string
  splitMode: PaperRewriteSplitMode
  originalText: string
  rewrittenText: string
  beforeDuplicationRate: number
  afterDuplicationRate: number
  confidence: number
  rewriteCount: number
  notes: string[]
}

export interface PaperRewriteGenerateRequest {
  mode: PaperRewriteMode
  splitMode: PaperRewriteSplitMode
  title?: string
  content?: string
  file?: File
}

export interface PaperRewriteGenerateResponse {
  result: PaperRewriteResult
  source: "local" | "remote"
  message?: string
}

export interface PaperRewriteExportRequest {
  result: PaperRewriteResult
  orientationMode?: WordPageOrientationMode
  alignmentMode?: WordCellAlignmentMode
  presetId?: WordExportPresetId
}

export interface PaperRewriteExportResult {
  blob: Blob
  fileName: string
  source: "local" | "remote"
  fileFormat?: "doc"
  message?: string
}
