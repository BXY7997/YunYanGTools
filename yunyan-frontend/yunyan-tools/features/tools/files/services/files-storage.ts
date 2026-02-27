import { createOnlineCanvasDraftStorageKeys } from "@/features/tools/shared/diagram/constants/online-canvas-storage"
import { ONLINE_CANVAS_SYNC_BUFFER_KEY } from "@/features/tools/shared/diagram/services/online-canvas-sync-buffer"
import { filesToolCatalog } from "@/features/tools/files/constants/files-config"
import { FILES_META_STORAGE_KEY } from "@/features/tools/files/constants/files-storage-keys"
import type {
  FilesMetaPatch,
  FilesQueryRequest,
  FilesQueryResult,
  FilesQuotaSummary,
  FilesRecord,
  FilesToolType,
} from "@/features/tools/files/types/files"

interface FilesMetaItem {
  name?: string
  description?: string
  updatedAt?: string
}

type FilesMetaMap = Record<string, FilesMetaItem>

interface SyncBufferEntry {
  id?: string
  toolId?: string
  syncedAt?: string
  payload?: unknown
}

function canUseStorage() {
  return typeof window !== "undefined"
}

function normalizeDateString(value: unknown, fallbackIso: string) {
  if (typeof value !== "string") {
    return fallbackIso
  }
  const normalized = value.trim()
  if (!normalized) {
    return fallbackIso
  }
  const timestamp = Date.parse(normalized)
  if (!Number.isFinite(timestamp)) {
    return fallbackIso
  }
  return new Date(timestamp).toISOString()
}

function readStorageJson<T>(key: string): T | null {
  if (!canUseStorage()) {
    return null
  }

  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return null
    }
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeStorageJson<T>(key: string, value: T) {
  if (!canUseStorage()) {
    return
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore localStorage write failures.
  }
}

function readDraftEnvelopeValue<T>(storageKey: string): T | null {
  const parsed = readStorageJson<unknown>(storageKey)
  if (!parsed) {
    return null
  }

  if (typeof parsed === "object" && parsed && "value" in parsed) {
    return (parsed as { value: T }).value
  }

  return parsed as T
}

function readFilesMetaMap(): FilesMetaMap {
  const parsed = readStorageJson<unknown>(FILES_META_STORAGE_KEY)
  if (!parsed || typeof parsed !== "object") {
    return {}
  }

  return parsed as FilesMetaMap
}

function writeFilesMetaMap(next: FilesMetaMap) {
  writeStorageJson(FILES_META_STORAGE_KEY, next)
}

function createLocalRecordId(toolType: FilesToolType) {
  return `local:${toolType}:draft`
}

function createCloudRecordId(sourceId: string) {
  return `cloud:${sourceId}`
}

function formatDocumentSummary(document: unknown, fallbackText: string) {
  if (!document || typeof document !== "object") {
    return fallbackText
  }

  const candidate = document as {
    nodes?: unknown
    edges?: unknown
  }

  const nodeCount = Array.isArray(candidate.nodes) ? candidate.nodes.length : null
  const edgeCount = Array.isArray(candidate.edges) ? candidate.edges.length : null

  if (typeof nodeCount === "number" && typeof edgeCount === "number") {
    return `节点 ${nodeCount} / 连线 ${edgeCount}`
  }

  if (typeof nodeCount === "number") {
    return `节点 ${nodeCount}`
  }

  return fallbackText
}

function formatTextPreview(value: unknown, fallbackText: string) {
  if (typeof value !== "string") {
    return fallbackText
  }
  const normalized = value.replace(/\s+/g, " ").trim()
  if (!normalized) {
    return fallbackText
  }
  return normalized.slice(0, 120)
}

function applyMetadata(record: FilesRecord, metadataMap: FilesMetaMap): FilesRecord {
  const metadata = metadataMap[record.id]
  if (!metadata) {
    return record
  }

  const updatedAt = normalizeDateString(metadata.updatedAt, record.updatedAt)
  return {
    ...record,
    name: metadata.name?.trim() || record.name,
    description:
      metadata.description !== undefined
        ? metadata.description
        : record.description,
    updatedAt,
  }
}

function resolveToolCatalogItem(toolType: string) {
  return filesToolCatalog.find((item) => item.toolType === toolType)
}

function collectLocalDraftRecords(metadataMap: FilesMetaMap): FilesRecord[] {
  if (!canUseStorage()) {
    return []
  }

  const nowIso = new Date().toISOString()

  return filesToolCatalog
    .map((catalogItem) => {
      const keys = createOnlineCanvasDraftStorageKeys(catalogItem.toolType)
      const sessionValue = readDraftEnvelopeValue<unknown>(keys.session)
      const draftDocumentFromSession =
        sessionValue &&
        typeof sessionValue === "object" &&
        "document" in sessionValue
          ? (sessionValue as { document?: unknown }).document
          : null

      const draftDocument =
        draftDocumentFromSession ||
        readDraftEnvelopeValue<unknown>(keys.document)

      if (!draftDocument || typeof draftDocument !== "object") {
        return null
      }

      const draftInput = readDraftEnvelopeValue<string>(keys.input)
      const recordId = createLocalRecordId(catalogItem.toolType)
      const openPath = `${catalogItem.route}?storage=local`

      const documentCandidate = draftDocument as {
        title?: unknown
        generatedAt?: unknown
      }

      const generatedAt = normalizeDateString(documentCandidate.generatedAt, nowIso)
      const updatedAt =
        sessionValue &&
        typeof sessionValue === "object" &&
        "updatedAt" in sessionValue &&
        typeof (sessionValue as { updatedAt?: unknown }).updatedAt === "number"
          ? new Date((sessionValue as { updatedAt: number }).updatedAt).toISOString()
          : generatedAt

      const baseName =
        typeof documentCandidate.title === "string" &&
        documentCandidate.title.trim().length > 0
          ? documentCandidate.title.trim()
          : `${catalogItem.label}本地草稿`

      const baseDescription = formatTextPreview(draftInput, "来自在线画图模块的本地草稿")

      const record: FilesRecord = {
        id: recordId,
        sourceId: recordId,
        storage: "local",
        toolType: catalogItem.toolType,
        toolLabel: catalogItem.label,
        iconName: catalogItem.iconName,
        name: baseName,
        description: baseDescription,
        summary: formatDocumentSummary(draftDocument, "本地草稿记录"),
        createdAt: generatedAt,
        updatedAt,
        openPath,
      }

      return applyMetadata(record, metadataMap)
    })
    .filter((item): item is FilesRecord => Boolean(item))
}

function readSyncBufferEntries(): SyncBufferEntry[] {
  const parsed = readStorageJson<unknown>(ONLINE_CANVAS_SYNC_BUFFER_KEY)
  if (!Array.isArray(parsed)) {
    return []
  }
  return parsed as SyncBufferEntry[]
}

function collectCloudSyncRecords(metadataMap: FilesMetaMap): FilesRecord[] {
  if (!canUseStorage()) {
    return []
  }

  const nowIso = new Date().toISOString()

  return readSyncBufferEntries()
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null
      }

      const sourceId =
        typeof entry.id === "string" && entry.id.trim().length > 0
          ? entry.id.trim()
          : ""
      const toolType =
        typeof entry.toolId === "string" && entry.toolId.trim().length > 0
          ? entry.toolId.trim()
          : ""

      if (!sourceId || !toolType) {
        return null
      }

      const catalogItem = resolveToolCatalogItem(toolType)
      if (!catalogItem) {
        return null
      }

      const payload =
        entry.payload && typeof entry.payload === "object"
          ? (entry.payload as Record<string, unknown>)
          : null
      const document = payload?.document
      const prompt = payload?.input ?? payload?.prompt

      const syncTimestamp = normalizeDateString(entry.syncedAt, nowIso)
      const generatedAt =
        document && typeof document === "object" && "generatedAt" in document
          ? normalizeDateString((document as { generatedAt?: unknown }).generatedAt, syncTimestamp)
          : syncTimestamp

      const recordId = createCloudRecordId(sourceId)
      const openPath = `${catalogItem.route}?storage=cloud&id=${encodeURIComponent(sourceId)}`

      const baseName =
        document &&
        typeof document === "object" &&
        typeof (document as { title?: unknown }).title === "string" &&
        (document as { title: string }).title.trim().length > 0
          ? (document as { title: string }).title.trim()
          : `${catalogItem.label}-${new Date(syncTimestamp).toLocaleString()}`

      const baseDescription = formatTextPreview(prompt, "来自云端同步缓存")

      const record: FilesRecord = {
        id: recordId,
        sourceId,
        storage: "cloud",
        toolType: catalogItem.toolType,
        toolLabel: catalogItem.label,
        iconName: catalogItem.iconName,
        name: baseName,
        description: baseDescription,
        summary: formatDocumentSummary(document, "云端同步记录"),
        createdAt: generatedAt,
        updatedAt: syncTimestamp,
        openPath,
      }

      return applyMetadata(record, metadataMap)
    })
    .filter((item): item is FilesRecord => Boolean(item))
}

function resolveCloudQuota(
  toolFilter: FilesQueryRequest["toolFilter"],
  totalCount: number
): FilesQuotaSummary {
  if (toolFilter === "all") {
    const quotaLimit = filesToolCatalog.reduce((sum, item) => sum + item.cloudQuotaLimit, 0)
    return {
      used: totalCount,
      limit: quotaLimit,
      ratio: quotaLimit > 0 ? Math.min(100, Math.round((totalCount / quotaLimit) * 100)) : 0,
    }
  }

  const target = filesToolCatalog.find((item) => item.toolType === toolFilter)
  const quotaLimit = target?.cloudQuotaLimit || 20
  return {
    used: totalCount,
    limit: quotaLimit,
    ratio: quotaLimit > 0 ? Math.min(100, Math.round((totalCount / quotaLimit) * 100)) : 0,
  }
}

function toLowerCaseSafe(value: string) {
  return value.toLocaleLowerCase()
}

function applyQueryFilters(
  records: FilesRecord[],
  request: FilesQueryRequest
): FilesRecord[] {
  const normalizedKeyword = request.keyword.trim()
  const hasKeyword = normalizedKeyword.length > 0
  const keyword = toLowerCaseSafe(normalizedKeyword)

  return records.filter((record) => {
    if (request.toolFilter !== "all" && record.toolType !== request.toolFilter) {
      return false
    }

    if (!hasKeyword) {
      return true
    }

    const searchableText = [record.name, record.description, record.summary, record.toolLabel]
      .join(" ")
      .toLocaleLowerCase()

    return searchableText.includes(keyword)
  })
}

function sortByUpdatedAtDesc(records: FilesRecord[]) {
  return [...records].sort((left, right) => {
    const rightTimestamp = Date.parse(right.updatedAt)
    const leftTimestamp = Date.parse(left.updatedAt)
    return (Number.isFinite(rightTimestamp) ? rightTimestamp : 0) -
      (Number.isFinite(leftTimestamp) ? leftTimestamp : 0)
  })
}

export function queryFilesFromLocalStorage(request: FilesQueryRequest): FilesQueryResult {
  const metadataMap = readFilesMetaMap()
  const allRecords =
    request.storage === "local"
      ? collectLocalDraftRecords(metadataMap)
      : collectCloudSyncRecords(metadataMap)

  const filtered = applyQueryFilters(allRecords, request)
  const sorted = sortByUpdatedAtDesc(filtered)

  const startIndex = Math.max(0, (request.pageNumber - 1) * request.pageSize)
  const paged = sorted.slice(startIndex, startIndex + request.pageSize)

  return {
    source: "local",
    records: paged,
    total: sorted.length,
    quota: request.storage === "cloud" ? resolveCloudQuota(request.toolFilter, sorted.length) : null,
    message:
      request.storage === "cloud"
        ? "已加载云端同步缓存数据，可继续接入后端接口。"
        : "已加载浏览器本地文件数据。",
  }
}

export function updateLocalFilesMetadata(record: FilesRecord, patch: FilesMetaPatch) {
  const metadataMap = readFilesMetaMap()
  metadataMap[record.id] = {
    name: patch.name.trim() || record.name,
    description: patch.description,
    updatedAt: new Date().toISOString(),
  }
  writeFilesMetaMap(metadataMap)
}

function clearLocalDraftByToolType(toolType: FilesToolType) {
  if (!canUseStorage()) {
    return
  }
  const keys = createOnlineCanvasDraftStorageKeys(toolType)
  const targetKeys = Object.values(keys)
  targetKeys.forEach((key) => {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // Ignore remove failures.
    }
  })
}

function removeCloudSyncBufferRecord(sourceId: string) {
  if (!canUseStorage()) {
    return
  }
  const entries = readSyncBufferEntries()
  const nextEntries = entries.filter((item) => !(item && item.id === sourceId))
  writeStorageJson(ONLINE_CANVAS_SYNC_BUFFER_KEY, nextEntries)
}

export function deleteLocalFilesRecord(record: FilesRecord) {
  if (record.storage === "local") {
    clearLocalDraftByToolType(record.toolType)
  } else {
    removeCloudSyncBufferRecord(record.sourceId)
  }

  const metadataMap = readFilesMetaMap()
  if (metadataMap[record.id]) {
    delete metadataMap[record.id]
    writeFilesMetaMap(metadataMap)
  }
}
