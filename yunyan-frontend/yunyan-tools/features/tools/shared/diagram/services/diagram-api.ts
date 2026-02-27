import { buildDiagramDocument } from "@/features/tools/shared/diagram/services/diagram-parser"
import { exportDiagramDocument } from "@/features/tools/shared/diagram/services/diagram-export"
import { isToolsApiConfigured, toolsApiEndpoints } from "@/features/tools/shared/constants/api-config"
import {
  buildToolApiFallbackNotice,
  buildToolApiInvalidPayloadFallbackNotice,
} from "@/features/tools/shared/constants/tool-copy"
import {
  ToolApiError,
  toolsApiClient,
} from "@/features/tools/shared/services/tool-api-client"
import { persistOnlineCanvasSyncBuffer } from "@/features/tools/shared/diagram/services/online-canvas-sync-buffer"
import type {
  DiagramExportRequest,
  DiagramGenerateRequest,
  DiagramGenerateResponse,
  DiagramRenderConfig,
  DiagramSyncRequest,
  DiagramSyncResult,
  DiagramToolId,
} from "@/features/tools/shared/diagram/types/diagram"

const artificialDelay = (duration = 220) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, duration)
  })

export async function generateDiagramByApi(
  request: DiagramGenerateRequest,
  options?: {
    signal?: AbortSignal
  }
): Promise<DiagramGenerateResponse> {
  if (options?.signal?.aborted) {
    throw new DOMException("用户取消操作", "AbortError")
  }

  await artificialDelay()

  const document = buildDiagramDocument(request.toolId, request.input, request.config)

  return {
    source: "local",
    document,
    message: "已按当前配置完成结构生成。",
  }
}

export async function exportDiagramByApi(
  request: DiagramExportRequest,
  tone: "sky" | "emerald" | "amber" | "violet" | "slate",
  runtimeConfig: DiagramRenderConfig
) {
  await exportDiagramDocument(request, tone, runtimeConfig)
}

const DIAGRAM_SYNC_ENDPOINT_MAP: Record<DiagramToolId, string> = {
  "er-diagram": toolsApiEndpoints.erDiagram.sync,
  "feature-structure": toolsApiEndpoints.featureStructure.sync,
  "software-engineering": toolsApiEndpoints.softwareEngineering.sync,
  "architecture-diagram": toolsApiEndpoints.architectureDiagram.sync,
  "mind-map": toolsApiEndpoints.mindMap.sync,
}

type RemoteDiagramSyncResponse = {
  syncId?: string
  syncedAt?: string
  message?: string
}

function createSyncId(toolId: DiagramToolId) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `${toolId}-${Date.now()}-${Math.floor(Math.random() * 10_000)}`
}

function normalizeRemoteDiagramSyncResponse(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null
  }

  const candidate = payload as RemoteDiagramSyncResponse
  return {
    syncId: typeof candidate.syncId === "string" ? candidate.syncId.trim() : "",
    syncedAt: typeof candidate.syncedAt === "string" ? candidate.syncedAt.trim() : "",
    message: typeof candidate.message === "string" ? candidate.message.trim() : "",
  }
}

function persistLocalDiagramSync(
  payload: DiagramSyncRequest,
  fallbackMessage: string
): DiagramSyncResult {
  const syncId = createSyncId(payload.toolId)
  const syncedAt = payload.syncedAt

  if (typeof window === "undefined") {
    return {
      source: "local",
      syncedAt,
      syncId,
      message: fallbackMessage,
    }
  }

  persistOnlineCanvasSyncBuffer({
    toolId: payload.toolId,
    syncedAt,
    payload,
    maxCount: 48,
  })

  return {
    source: "local",
    syncedAt,
    syncId,
    message: fallbackMessage,
  }
}

export async function syncDiagramDraftByApi(
  payload: DiagramSyncRequest,
  options?: {
    signal?: AbortSignal
  }
): Promise<DiagramSyncResult> {
  const endpoint = DIAGRAM_SYNC_ENDPOINT_MAP[payload.toolId]

  if (isToolsApiConfigured() && endpoint) {
    try {
      const remote = await toolsApiClient.request<unknown, DiagramSyncRequest>(endpoint, {
        method: "POST",
        body: payload,
        signal: options?.signal,
      })

      const normalized = normalizeRemoteDiagramSyncResponse(remote)
      if (!normalized) {
        return persistLocalDiagramSync(
          payload,
          buildToolApiInvalidPayloadFallbackNotice({
            subject: "在线画布同步返回结构异常",
            fallbackTarget: "本地同步缓存",
          })
        )
      }

      return {
        source: "remote",
        syncId: normalized.syncId || createSyncId(payload.toolId),
        syncedAt: normalized.syncedAt || payload.syncedAt,
        message: normalized.message || "已同步到云端，可在 /apps/files 查看。",
      }
    } catch (error) {
      const fallbackMessage =
        error instanceof ToolApiError
          ? buildToolApiFallbackNotice({
              subject: "在线画布同步",
              fallbackTarget: "本地同步缓存",
              status: error.status,
              details: error.details,
            })
          : "云端同步异常，已回退本地同步缓存。"

      return persistLocalDiagramSync(payload, fallbackMessage)
    }
  }

  return persistLocalDiagramSync(
    payload,
    "工具后端未配置，已写入本地同步缓存，后续可在 /apps/files 接入后端列表。"
  )
}
