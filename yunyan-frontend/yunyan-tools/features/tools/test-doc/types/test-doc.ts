import type {
  WordCellAlignmentMode,
  WordExportPresetId,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"

export type TestDocMode = "ai"

export type TestCaseStatus = "未执行" | "通过" | "失败" | "阻塞"

export interface TestCaseItem {
  id: string
  name: string
  steps: string[]
  expectedResult: string
  actualResult: string
  status: TestCaseStatus
}

export interface TestDocument {
  title: string
  module: string
  scope: string
  precondition: string
  environment: string
  cases: TestCaseItem[]
  conclusion: string
}

export interface TestDocGenerateRequest {
  mode: TestDocMode
  aiPrompt: string
}

export interface TestDocGenerateResponse {
  document: TestDocument
  source: "local" | "remote"
  message?: string
}

export interface TestDocExportRequest {
  document: TestDocument
  orientationMode?: WordPageOrientationMode
  alignmentMode?: WordCellAlignmentMode
  presetId?: WordExportPresetId
}

export interface TestDocExportResult {
  blob: Blob
  fileName: string
  source: "local" | "remote"
  fileFormat?: "doc"
  message?: string
}
