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

export interface ToolRuntimeSyncPayload<TDraft, TPreview> {
  draft: TDraft
  preview: TPreview | null
  meta?: Record<string, unknown>
}

export interface ToolRuntimeLoadResponse<TDraft> {
  draft: TDraft | null
  source: "local" | "remote"
  message?: string
}

export interface ToolRuntimeSyncResponse {
  source: "local" | "remote"
  syncedAt: string
  message?: string
}

export type ToolRuntimeActionStage =
  | "idle"
  | "loading"
  | "generating"
  | "exporting"
  | "syncing"
  | "running"
  | "error"

export interface ToolRuntimeCapabilities {
  load: boolean
  generate: boolean
  export: boolean
  sync: boolean
}

export interface ToolRuntimeContract<
  TGenerateRequest,
  TGenerateResponse,
  TExportRequest,
  TExportResponse,
  TPreview,
  TDraft,
  TSyncPayload = ToolRuntimeSyncPayload<TDraft, TPreview>,
  TLoadDraft = TDraft,
> {
  toolId: string
  schemaVersion: number
  defaultExportPresetId: WordExportPresetId
  capabilities: ToolRuntimeCapabilities
  load: (
    options?: ToolRuntimeActionOptions
  ) => Promise<ToolRuntimeLoadResponse<TLoadDraft>>
  generate: (
    request: TGenerateRequest,
    options?: ToolRuntimeActionOptions
  ) => Promise<TGenerateResponse>
  export: (
    request: TExportRequest,
    options?: ToolRuntimeActionOptions
  ) => Promise<TExportResponse>
  sync: (
    payload: TSyncPayload,
    options?: ToolRuntimeActionOptions
  ) => Promise<ToolRuntimeSyncResponse>
  precheck: (...args: unknown[]) => string[]
  buildPreview: (generated: TPreview | null, draft: TDraft) => TPreview
}
