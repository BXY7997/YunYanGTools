import {
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
  createToolExportDateToken,
  shouldUseToolRemote,
} from "@/features/tools/shared/services/tool-api-runtime"
import {
  fileCollectorDefaultAllowResubmit,
  fileCollectorDefaultChannelStatus,
  fileCollectorDefaultChannelVisibility,
  fileCollectorDefaultIntroText,
  fileCollectorDefaultMaxFilesPerMember,
  fileCollectorDefaultMaxSingleFileSizeMb,
  fileCollectorDefaultShareBaseUrl,
} from "@/features/tools/file-collector/constants/file-collector-config"
import {
  buildFileCollectorChannelCode,
  buildFileCollectorDocument,
  createFileCollectorLedgerCsv,
  createFileCollectorMappingJson,
  createFileCollectorMissingText,
} from "@/features/tools/file-collector/services/file-collector-model"
import type {
  FileCollectorDocument,
  FileCollectorExportFormat,
  FileCollectorExportRequest,
  FileCollectorExportResult,
  FileCollectorGenerateRequest,
  FileCollectorGenerateResponse,
} from "@/features/tools/file-collector/types/file-collector"

interface FileCollectorActionOptions {
  preferRemote?: boolean
  signal?: AbortSignal
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

function parseRemoteDocument(value: unknown): FileCollectorDocument | null {
  const root = toRecord(value)
  if (!root) {
    return null
  }

  const nested =
    toRecord(root.data) ||
    toRecord(root.result) ||
    toRecord(root.document) ||
    root

  const candidate = nested.document ? toRecord(nested.document) : nested
  if (!candidate) {
    return null
  }

  const hasSummary = toRecord(candidate.summary)
  const hasSubmissions = Array.isArray(candidate.submissions)
  const title = typeof candidate.scenarioTitle === "string" ? candidate.scenarioTitle : ""

  if (!title || !hasSummary || !hasSubmissions) {
    return null
  }

  const channel = toRecord(candidate.channel)
  const scenarioTitle =
    typeof candidate.scenarioTitle === "string" ? candidate.scenarioTitle : "文件收集任务"
  const channelCode =
    typeof channel?.channelCode === "string" && channel.channelCode.trim().length > 0
      ? channel.channelCode.trim()
      : buildFileCollectorChannelCode(scenarioTitle)
  const shareLink =
    typeof channel?.shareLink === "string" && channel.shareLink.trim().length > 0
      ? channel.shareLink.trim()
      : `${fileCollectorDefaultShareBaseUrl}?task=${encodeURIComponent(channelCode)}`

  return {
    ...(candidate as unknown as FileCollectorDocument),
    channel: {
      channelCode,
      shareLink,
      status:
        typeof channel?.status === "string" && channel.status.trim().length > 0
          ? (channel.status as FileCollectorDocument["channel"]["status"])
          : fileCollectorDefaultChannelStatus,
      visibility:
        typeof channel?.visibility === "string" && channel.visibility.trim().length > 0
          ? (channel.visibility as FileCollectorDocument["channel"]["visibility"])
          : fileCollectorDefaultChannelVisibility,
      allowResubmit:
        typeof channel?.allowResubmit === "boolean"
          ? channel.allowResubmit
          : fileCollectorDefaultAllowResubmit,
      maxFilesPerMember:
        typeof channel?.maxFilesPerMember === "number" &&
        Number.isFinite(channel.maxFilesPerMember) &&
        channel.maxFilesPerMember > 0
          ? Math.round(channel.maxFilesPerMember)
          : fileCollectorDefaultMaxFilesPerMember,
      maxSingleFileSizeMb:
        typeof channel?.maxSingleFileSizeMb === "number" &&
        Number.isFinite(channel.maxSingleFileSizeMb) &&
        channel.maxSingleFileSizeMb > 0
          ? Math.round(channel.maxSingleFileSizeMb)
          : fileCollectorDefaultMaxSingleFileSizeMb,
      introText:
        typeof channel?.introText === "string" && channel.introText.trim().length > 0
          ? channel.introText.trim()
          : fileCollectorDefaultIntroText,
    },
  }
}

function buildLocalGenerateResponse(
  request: FileCollectorGenerateRequest,
  message?: string
): FileCollectorGenerateResponse {
  return {
    document: buildFileCollectorDocument(request),
    source: "local",
    message,
  }
}

function createTextBlob(value: string, mimeType = "text/plain;charset=utf-8") {
  return new Blob([value], { type: mimeType })
}

function resolveExportFileName(document: FileCollectorDocument, format: FileCollectorExportFormat) {
  const token = createToolExportDateToken(new Date())
  const safeTitle = document.scenarioTitle.replace(/[\\/:*?"<>|\s]+/g, "-") || "file-collector"

  if (format === "ledger-csv") {
    return `${safeTitle}-台账-${token}.csv`
  }

  if (format === "missing-txt") {
    return `${safeTitle}-催交名单-${token}.txt`
  }

  return `${safeTitle}-重命名映射-${token}.json`
}

function createLocalExportBlob(
  document: FileCollectorDocument,
  format: FileCollectorExportFormat
) {
  if (format === "ledger-csv") {
    return createTextBlob(createFileCollectorLedgerCsv(document), "text/csv;charset=utf-8")
  }

  if (format === "missing-txt") {
    return createTextBlob(createFileCollectorMissingText(document))
  }

  return createTextBlob(createFileCollectorMappingJson(document), "application/json;charset=utf-8")
}

function resolveExportEndpoint(format: FileCollectorExportFormat) {
  if (format === "ledger-csv") {
    return toolsApiEndpoints.fileCollector.exportLedger
  }

  if (format === "missing-txt") {
    return toolsApiEndpoints.fileCollector.exportMissing
  }

  return toolsApiEndpoints.fileCollector.exportMapping
}

export async function generateFileCollectorData(
  request: FileCollectorGenerateRequest,
  options: FileCollectorActionOptions = {}
): Promise<FileCollectorGenerateResponse> {
  let fallbackNotice = ""

  if (shouldUseToolRemote(options.preferRemote)) {
    try {
      const remoteRaw = await toolsApiClient.request<unknown, FileCollectorGenerateRequest>(
        toolsApiEndpoints.fileCollector.generate,
        {
          method: "POST",
          body: request,
          signal: options.signal,
        }
      )

      const remoteDocument = parseRemoteDocument(remoteRaw)
      if (remoteDocument) {
        return {
          document: remoteDocument,
          source: "remote",
          message: "远程收集分析完成",
        }
      }

      fallbackNotice = buildToolApiInvalidPayloadFallbackNotice({
        subject: "远程收集服务返回结构异常",
        fallbackTarget: "本地分析",
      })
    } catch (error) {
      if (error instanceof ToolApiError) {
        fallbackNotice = buildToolApiFallbackNotice({
          subject: "远程收集服务",
          fallbackTarget: "本地分析",
          status: error.status,
          details: error.details,
        })
      } else {
        fallbackNotice = "远程收集服务异常，已回退本地分析"
      }
    }
  }

  return buildLocalGenerateResponse(request, fallbackNotice || "本地收集分析完成")
}

export async function exportFileCollectorData(
  request: FileCollectorExportRequest,
  options: FileCollectorActionOptions = {}
): Promise<FileCollectorExportResult> {
  let fallbackNotice = ""

  if (shouldUseToolRemote(options.preferRemote)) {
    try {
      const remoteBlob = await toolsApiClient.request<Blob, FileCollectorExportRequest>(
        resolveExportEndpoint(request.format),
        {
          method: "POST",
          body: request,
          signal: options.signal,
          responseType: "blob",
        }
      )

      return {
        blob: remoteBlob,
        fileName: resolveExportFileName(request.document, request.format),
        source: "remote",
        message: "远程导出完成",
      }
    } catch (error) {
      if (error instanceof ToolApiError) {
        fallbackNotice = buildToolApiFallbackNotice({
          subject: "远程导出服务",
          fallbackTarget: "本地导出",
          status: error.status,
          details: error.details,
        })
      } else {
        fallbackNotice = "远程导出服务异常，已回退本地导出"
      }
    }
  }

  return {
    blob: createLocalExportBlob(request.document, request.format),
    fileName: resolveExportFileName(request.document, request.format),
    source: "local",
    message: fallbackNotice || "本地导出完成",
  }
}
