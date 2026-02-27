import {
  buildFeatureStructureTopDownLayout,
  parseFeatureStructureByIndent,
} from "@/features/tools/feature-structure/services/feature-structure-layout"
import { featureStructureApiContract } from "@/features/tools/feature-structure/constants/feature-structure-contract"
import { isToolsApiConfigured } from "@/features/tools/shared/constants/api-config"
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
  FeatureStructureGenerationRequest,
  FeatureStructureGenerationResponse,
  FeatureStructureSyncRequest,
  FeatureStructureSyncResult,
} from "@/features/tools/feature-structure/types/feature-structure"

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("用户取消操作", "AbortError")
  }
}

async function sleepWithSignal(duration = 180, signal?: AbortSignal) {
  throwIfAborted(signal)
  await new Promise<void>((resolve, reject) => {
    const timerId = window.setTimeout(() => {
      if (signal) {
        signal.removeEventListener("abort", onAbort)
      }
      resolve()
    }, duration)

    const onAbort = () => {
      window.clearTimeout(timerId)
      signal?.removeEventListener("abort", onAbort)
      reject(new DOMException("用户取消操作", "AbortError"))
    }

    signal?.addEventListener("abort", onAbort, { once: true })
  })
}

export async function generateFeatureStructureByApi(
  request: FeatureStructureGenerationRequest,
  options?: {
    signal?: AbortSignal
  }
): Promise<FeatureStructureGenerationResponse> {
  throwIfAborted(options?.signal)
  await sleepWithSignal(180, options?.signal)
  throwIfAborted(options?.signal)

  const parsedItems = parseFeatureStructureByIndent(request.prompt)
  throwIfAborted(options?.signal)
  const { nodes, edges, width, height } = buildFeatureStructureTopDownLayout(parsedItems, {
    nodeGapX: request.renderConfig.nodeGapX,
    nodeGapY: request.renderConfig.nodeGapY,
    fontSize: request.renderConfig.fontSize,
    nodeWidth: request.layoutOptions?.nodeWidth,
    singleCharPerLine: request.layoutOptions?.singleCharPerLine ?? true,
    avoidCrossing: request.layoutOptions?.avoidCrossing ?? true,
  })

  const document = {
    title: "功能结构图",
    parserKind: "hierarchy" as const,
    nodes,
    edges,
    width,
    height,
    generatedAt: new Date().toISOString(),
  }

  return {
    source: "local",
    document,
    message: "已完成功能结构图生成。",
  }
}

type RemoteSyncResponse = {
  syncId?: string
  syncedAt?: string
  message?: string
}

function createFeatureStructureSyncId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `fsync-${Date.now()}-${Math.floor(Math.random() * 10_000)}`
}

function normalizeRemoteSyncResponse(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null
  }

  const candidate = payload as RemoteSyncResponse
  const syncId = typeof candidate.syncId === "string" ? candidate.syncId.trim() : ""
  const syncedAt =
    typeof candidate.syncedAt === "string" ? candidate.syncedAt.trim() : ""
  const message =
    typeof candidate.message === "string" ? candidate.message.trim() : ""

  return {
    syncId,
    syncedAt,
    message,
  }
}

function persistLocalSyncDraft(request: FeatureStructureSyncRequest, fallbackMessage: string) {
  const { syncId } = persistOnlineCanvasSyncBuffer({
    toolId: request.toolId,
    syncedAt: request.syncedAt,
    payload: request,
    maxCount: 48,
  })

  return {
    syncId,
    syncedAt: request.syncedAt,
    message: fallbackMessage,
  }
}

export async function syncFeatureStructureDraft(
  request: FeatureStructureSyncRequest,
  options?: {
    signal?: AbortSignal
  }
): Promise<FeatureStructureSyncResult> {
  throwIfAborted(options?.signal)

  if (isToolsApiConfigured()) {
    try {
      const remote = await toolsApiClient.request<unknown, FeatureStructureSyncRequest>(
        featureStructureApiContract.syncPath,
        {
          method: "POST",
          body: request,
          signal: options?.signal,
        }
      )

      const normalized = normalizeRemoteSyncResponse(remote)
      if (!normalized) {
        const fallback = persistLocalSyncDraft(
          request,
          buildToolApiInvalidPayloadFallbackNotice({
            subject: "云端同步返回结构异常",
            fallbackTarget: "本地同步缓存",
          })
        )
        return {
          source: "local",
          message: fallback.message,
          syncId: fallback.syncId,
          syncedAt: fallback.syncedAt,
        }
      }

      return {
        source: "remote",
        syncId: normalized.syncId || createFeatureStructureSyncId(),
        syncedAt: normalized.syncedAt || request.syncedAt,
        message: normalized.message || "云端同步成功，可在文件中心继续处理。",
      }
    } catch (error) {
      const fallbackMessage =
        error instanceof ToolApiError
          ? buildToolApiFallbackNotice({
              subject: "云端同步",
              fallbackTarget: "本地同步缓存",
              status: error.status,
              details: error.details,
            })
          : "云端同步异常，已回退本地同步缓存。"

      const fallback = persistLocalSyncDraft(request, fallbackMessage)
      return {
        source: "local",
        message: fallback.message,
        syncId: fallback.syncId,
        syncedAt: fallback.syncedAt,
      }
    }
  }

  const fallback = persistLocalSyncDraft(
    request,
    "工具后端未配置，已保存到本地同步缓存，后续可在 /apps/files 接入云端后迁移。"
  )
  return {
    source: "local",
    message: fallback.message,
    syncId: fallback.syncId,
    syncedAt: fallback.syncedAt,
  }
}

export async function exportFeatureStructureAsJson(graphDocument: FeatureStructureGenerationResponse["document"]) {
  const blob = new Blob([JSON.stringify(graphDocument, null, 2)], {
    type: "application/json;charset=utf-8",
  })
  const url = URL.createObjectURL(blob)
  const anchor = window.document.createElement("a")
  anchor.href = url
  anchor.download = `feature-structure-${Date.now()}.json`
  window.document.body.appendChild(anchor)
  anchor.click()
  window.document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
