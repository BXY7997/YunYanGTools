import type { WordExportPresetId } from "@/features/tools/shared/types/word-export"

export interface ToolRuntimeActionOptions {
  preferRemote?: boolean
  signal?: AbortSignal
}

export interface ToolRuntimeGenerateResponse<TDocument> {
  document: TDocument
  source: "local" | "remote"
  message?: string
}

export interface ToolRuntimeContract<
  TGenerateRequest,
  TGenerateResponse,
  TExportRequest,
  TExportResponse,
  TPreview,
  TDraft,
> {
  toolId: string
  schemaVersion: number
  defaultExportPresetId: WordExportPresetId
  generate: (
    request: TGenerateRequest,
    options?: ToolRuntimeActionOptions
  ) => Promise<TGenerateResponse>
  export: (
    request: TExportRequest,
    options?: ToolRuntimeActionOptions
  ) => Promise<TExportResponse>
  precheck: (...args: unknown[]) => string[]
  buildPreview: (generated: TPreview | null, draft: TDraft) => TPreview
}
