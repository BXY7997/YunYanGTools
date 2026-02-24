import type {
  WordCellAlignmentMode,
  WordExportPresetId,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"

export type UseCaseDocMode = "ai" | "manual"

export interface UseCaseManualForm {
  name: string
  actor: string
  summary: string
  precondition: string
  postcondition: string
  basicFlow: string
  extensionFlow: string
  exceptionFlow: string
  notes: string
}

export interface UseCaseDocument {
  title: string
  actor: string
  summary: string
  precondition: string
  postcondition: string
  basicFlow: string[]
  extensionFlow: string[]
  exceptionFlow: string[]
  notes: string
}

export interface UseCaseDocGenerateRequest {
  mode: UseCaseDocMode
  aiPrompt?: string
  manual?: UseCaseManualForm
}

export interface UseCaseDocGenerateResponse {
  document: UseCaseDocument
  source: "local" | "remote"
  message?: string
}

export interface UseCaseDocExportRequest {
  document: UseCaseDocument
  orientationMode?: WordPageOrientationMode
  alignmentMode?: WordCellAlignmentMode
  presetId?: WordExportPresetId
}

export interface UseCaseDocExportResult {
  blob: Blob
  fileName: string
  source: "local" | "remote"
  fileFormat?: "doc"
  message?: string
}

export interface UseCaseDocTestDataResult {
  aiPrompt: string
  manual: UseCaseManualForm
  source: "local" | "remote"
  message?: string
}
