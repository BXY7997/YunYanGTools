import type {
  WordCellAlignmentMode,
  WordExportPresetId,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"

export type WordTableMode = "ai" | "manual"

export interface WordTableBorderSides {
  top: number
  right: number
  bottom: number
  left: number
}

export interface WordTableBorderProfile {
  header: WordTableBorderSides
  body: WordTableBorderSides
  lastRow: WordTableBorderSides
}

export interface WordTableDocument {
  title: string
  headers: string[]
  rows: string[][]
  borderProfile: WordTableBorderProfile
}

export interface WordTableGenerateRequest {
  mode: WordTableMode
  aiPrompt?: string
  manual?: Partial<WordTableDocument>
}

export interface WordTableGenerateResponse {
  document: WordTableDocument
  source: "local" | "remote"
  message?: string
}

export interface WordTableExportRequest {
  document: WordTableDocument
  orientationMode?: WordPageOrientationMode
  alignmentMode?: WordCellAlignmentMode
  presetId?: WordExportPresetId
}

export type WordTableExportFormat = "normal" | "three-line"

export interface WordTableExportDocument {
  format: WordTableExportFormat
  blob: Blob
  fileName: string
}

export interface WordTableExportResult {
  documents: WordTableExportDocument[]
  source: "local" | "remote"
  fileFormat?: "doc"
  message?: string
}
