import type {
  ToolRuntimeContract,
  ToolRuntimeLoadResponse,
  ToolRuntimeSyncPayload,
  ToolRuntimeSyncResponse,
} from "@/features/tools/shared/types/tool-runtime"

type CreateToolRuntimeContractOptions<
  TGenerateRequest,
  TGenerateResponse,
  TExportRequest,
  TExportResponse,
  TPreview,
  TDraft,
  TSync = ToolRuntimeSyncPayload<TDraft, TPreview>,
  TLoad = TDraft,
> = Omit<
  ToolRuntimeContract<
    TGenerateRequest,
    TGenerateResponse,
    TExportRequest,
    TExportResponse,
    TPreview,
    TDraft,
    TSync,
    TLoad
  >,
  "capabilities" | "load" | "sync"
> & {
  load?: (
    options?: {
      preferRemote?: boolean
      signal?: AbortSignal
    }
  ) => Promise<ToolRuntimeLoadResponse<TLoad>>
  sync?: (
    payload: TSync,
    options?: {
      preferRemote?: boolean
      signal?: AbortSignal
    }
  ) => Promise<ToolRuntimeSyncResponse>
}

function defaultLoadRuntimeDraft<TLoad>(
  _options?: {
    preferRemote?: boolean
    signal?: AbortSignal
  }
) {
  return Promise.resolve({
    draft: null,
    source: "local" as const,
    message: "当前工具暂未接入草稿加载接口。",
  })
}

function defaultSyncRuntimeDraft(
  _payload: unknown,
  _options?: {
    preferRemote?: boolean
    signal?: AbortSignal
  }
) {
  return Promise.resolve({
    source: "local" as const,
    syncedAt: new Date().toISOString(),
    message: "当前工具暂未接入云端同步接口，已保留本地状态。",
  })
}

export function createToolRuntimeContract<
  TGenerateRequest,
  TGenerateResponse,
  TExportRequest,
  TExportResponse,
  TPreview,
  TDraft,
  TSync = ToolRuntimeSyncPayload<TDraft, TPreview>,
  TLoad = TDraft,
>(
  contract: CreateToolRuntimeContractOptions<
    TGenerateRequest,
    TGenerateResponse,
    TExportRequest,
    TExportResponse,
    TPreview,
    TDraft,
    TSync,
    TLoad
  >
) {
  const resolvedContract: ToolRuntimeContract<
    TGenerateRequest,
    TGenerateResponse,
    TExportRequest,
    TExportResponse,
    TPreview,
    TDraft,
    TSync,
    TLoad
  > = {
    ...contract,
    capabilities: {
      load: typeof contract.load === "function",
      generate: true,
      export: true,
      sync: typeof contract.sync === "function",
    },
    load: contract.load || defaultLoadRuntimeDraft<TLoad>,
    sync: contract.sync || defaultSyncRuntimeDraft,
  }

  return resolvedContract
}
