import {
  isToolsApiConfigured,
  toolsApiEndpoints,
} from "@/features/tools/shared/constants/api-config"
import {
  buildToolApiFallbackNotice,
  buildToolApiInvalidPayloadFallbackNotice,
} from "@/features/tools/shared/constants/tool-copy"
import {
  ToolApiError,
  toolsApiClient,
} from "@/features/tools/shared/services/tool-api-client"
import {
  deleteLocalFilesRecord,
  queryFilesFromLocalStorage,
  updateLocalFilesMetadata,
} from "@/features/tools/files/services/files-storage"
import type {
  FilesMetaPatch,
  FilesQueryRequest,
  FilesQueryResult,
  FilesRecord,
} from "@/features/tools/files/types/files"

interface FilesRemoteRecord {
  id?: string
  sourceId?: string
  storage?: string
  toolType?: string
  toolLabel?: string
  iconName?: string
  name?: string
  description?: string
  summary?: string
  createdAt?: string
  updatedAt?: string
  openPath?: string
}

interface FilesRemoteQueryPayload {
  records?: FilesRemoteRecord[]
  list?: FilesRemoteRecord[]
  total?: number
  quota?: {
    used?: number
    limit?: number
    ratio?: number
  }
  message?: string
}

function toFiniteNumber(value: unknown, fallbackValue: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallbackValue
}

function normalizeRemoteQueryPayload(payload: unknown): FilesQueryResult | null {
  if (!payload || typeof payload !== "object") {
    return null
  }

  const container = payload as Record<string, unknown>
  const data =
    container.data && typeof container.data === "object"
      ? (container.data as Record<string, unknown>)
      : container

  const remote = data as FilesRemoteQueryPayload
  const candidateList = Array.isArray(remote.records)
    ? remote.records
    : Array.isArray(remote.list)
      ? remote.list
      : null

  if (!candidateList) {
    return null
  }

  const records = candidateList
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null
      }
      const candidate = item as FilesRemoteRecord

      if (
        typeof candidate.id !== "string" ||
        typeof candidate.sourceId !== "string" ||
        typeof candidate.storage !== "string" ||
        typeof candidate.toolType !== "string" ||
        typeof candidate.toolLabel !== "string" ||
        typeof candidate.iconName !== "string" ||
        typeof candidate.name !== "string" ||
        typeof candidate.description !== "string" ||
        typeof candidate.summary !== "string" ||
        typeof candidate.createdAt !== "string" ||
        typeof candidate.updatedAt !== "string" ||
        typeof candidate.openPath !== "string"
      ) {
        return null
      }

      return {
        id: candidate.id,
        sourceId: candidate.sourceId,
        storage: candidate.storage === "cloud" ? "cloud" : "local",
        toolType: candidate.toolType,
        toolLabel: candidate.toolLabel,
        iconName: candidate.iconName,
        name: candidate.name,
        description: candidate.description,
        summary: candidate.summary,
        createdAt: candidate.createdAt,
        updatedAt: candidate.updatedAt,
        openPath: candidate.openPath,
      } as FilesRecord
    })
    .filter((item): item is FilesRecord => Boolean(item))

  const total = toFiniteNumber(remote.total, records.length)
  const quota =
    remote.quota && typeof remote.quota === "object"
      ? {
          used: toFiniteNumber(remote.quota.used, records.length),
          limit: toFiniteNumber(remote.quota.limit, Math.max(records.length, 1)),
          ratio: toFiniteNumber(remote.quota.ratio, 0),
        }
      : null

  return {
    source: "remote",
    records,
    total,
    quota,
    message:
      typeof remote.message === "string" && remote.message.trim().length > 0
        ? remote.message.trim()
        : "已从云端文件服务加载数据。",
  }
}

function createFallbackResult(
  request: FilesQueryRequest,
  message: string
): FilesQueryResult {
  const localResult = queryFilesFromLocalStorage(request)
  return {
    ...localResult,
    source: "local",
    message,
  }
}

export async function queryFilesWorkspaceData(
  request: FilesQueryRequest,
  options?: {
    signal?: AbortSignal
  }
): Promise<FilesQueryResult> {
  if (isToolsApiConfigured()) {
    try {
      const remote = await toolsApiClient.request<unknown, FilesQueryRequest>(
        toolsApiEndpoints.files.queryPage,
        {
          method: "POST",
          body: request,
          signal: options?.signal,
        }
      )

      const normalized = normalizeRemoteQueryPayload(remote)
      if (normalized) {
        return normalized
      }

      return createFallbackResult(
        request,
        buildToolApiInvalidPayloadFallbackNotice({
          subject: "文件列表返回结构异常",
          fallbackTarget: "本地文件缓存",
        })
      )
    } catch (error) {
      const fallbackMessage =
        error instanceof ToolApiError
          ? buildToolApiFallbackNotice({
              subject: "文件列表",
              fallbackTarget: "本地文件缓存",
              status: error.status,
              details: error.details,
            })
          : "文件服务异常，已回退到本地缓存。"

      return createFallbackResult(request, fallbackMessage)
    }
  }

  return createFallbackResult(
    request,
    "文件服务未配置，已使用本地文件缓存。"
  )
}

export async function updateFilesRecordMeta(
  record: FilesRecord,
  patch: FilesMetaPatch,
  options?: {
    signal?: AbortSignal
  }
) {
  if (isToolsApiConfigured()) {
    try {
      await toolsApiClient.request<unknown, { id: string; sourceId: string; storage: string; name: string; description: string }>(
        toolsApiEndpoints.files.updateMeta,
        {
          method: "POST",
          body: {
            id: record.id,
            sourceId: record.sourceId,
            storage: record.storage,
            name: patch.name,
            description: patch.description,
          },
          signal: options?.signal,
        }
      )

      return {
        source: "remote" as const,
        message: "文件信息已更新。",
      }
    } catch {
      // Fall through to local update.
    }
  }

  updateLocalFilesMetadata(record, patch)
  return {
    source: "local" as const,
    message: "文件信息已在本地更新。",
  }
}

export async function deleteFilesRecord(record: FilesRecord, options?: { signal?: AbortSignal }) {
  if (isToolsApiConfigured()) {
    try {
      await toolsApiClient.request<unknown, { id: string; sourceId: string; storage: string }>(
        toolsApiEndpoints.files.delete,
        {
          method: "POST",
          body: {
            id: record.id,
            sourceId: record.sourceId,
            storage: record.storage,
          },
          signal: options?.signal,
        }
      )

      return {
        source: "remote" as const,
        message: "文件已从云端删除。",
      }
    } catch {
      // Fall through to local delete.
    }
  }

  deleteLocalFilesRecord(record)
  return {
    source: "local" as const,
    message: "文件已从本地删除。",
  }
}
