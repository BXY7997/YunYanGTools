export type CourseCodeLanguage =
  | "Python3"
  | "JavaScript"
  | "Typescript"
  | "JAVA"
  | "C++"
  | "C"
  | "Go"

export type CourseCodeRunStatus = "success" | "error"

export interface CourseCodeRunResult {
  status: CourseCodeRunStatus
  output: string
  errorOutput?: string
  runtimeMs: number
  memoryKb: number
  warnings: string[]
  logs: string[]
}

export interface CourseCodeDocument {
  language: CourseCodeLanguage
  code: string
  title: string
  runResult: CourseCodeRunResult | null
}

export interface CourseCodeGenerateRequest {
  language: CourseCodeLanguage
  code?: string
  requestId?: string
}

export interface CourseCodeGenerateResponse {
  code: string
  title: string
  source: "local" | "remote"
  message?: string
}

export interface CourseCodeRunRequest {
  language: CourseCodeLanguage
  code: string
  stdin?: string
  requestId?: string
}

export interface CourseCodeRunResponse {
  result: CourseCodeRunResult
  source: "local" | "remote"
  message?: string
}

export interface CourseCodeExportRequest {
  language: CourseCodeLanguage
  code: string
  title?: string
}

export interface CourseCodeExportResult {
  blob: Blob
  fileName: string
  source: "local" | "remote"
  message?: string
}
