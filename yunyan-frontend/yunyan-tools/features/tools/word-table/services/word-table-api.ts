import { z } from "zod"

import {
  isToolsApiConfigured,
  toolsApiEndpoints,
} from "@/features/tools/shared/constants/api-config"
import {
  buildToolApiFallbackNotice,
  buildToolApiInvalidPayloadFallbackNotice,
  composeNoticeMessage,
  toolApiCopy,
} from "@/features/tools/shared/constants/tool-copy"
import {
  ToolApiError,
  toolsApiClient,
} from "@/features/tools/shared/services/tool-api-client"
import {
  composeVersionNotice,
  readSchemaVersion,
} from "@/features/tools/shared/services/tool-api-schema"
import {
  createWordTableDocumentFromPrompt,
  createDefaultWordTableDocument,
  normalizeWordTableDocument,
} from "@/features/tools/word-table/services/word-table-model"
import { createWordTableWordBlobs } from "@/features/tools/word-table/services/word-table-word-export"
import type {
  WordTableDocument,
  WordTableExportDocument,
  WordTableExportRequest,
  WordTableExportResult,
  WordTableGenerateRequest,
  WordTableGenerateResponse,
} from "@/features/tools/word-table/types/word-table"

interface WordTableActionOptions {
  preferRemote?: boolean
  signal?: AbortSignal
}

const wordTableRemoteGenerateSchema = z
  .object({
    version: z.string().trim().min(1).optional(),
    msg: z.string().optional(),
    message: z.string().optional(),
    data: z.unknown().optional(),
    document: z.unknown().optional(),
    table: z.unknown().optional(),
    title: z.string().optional(),
    headers: z.unknown().optional(),
    columns: z.unknown().optional(),
    rows: z.unknown().optional(),
  })
  .passthrough()
  .refine(
    (value) =>
      "data" in value ||
      "document" in value ||
      "table" in value ||
      typeof value.title === "string" ||
      "headers" in value ||
      "columns" in value ||
      "rows" in value,
    { message: "missing_word_table_signals" }
  )

function createExportDateToken() {
  const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  return dateFormatter.format(new Date()).replace(/\//g, "-")
}

function createExportFileName(formatLabel: string, dateToken: string) {
  return `Word表格-${formatLabel}-${dateToken}.doc`
}

function applyExportFileNames(
  documents: WordTableExportDocument[],
  dateToken: string
) {
  return documents.map((item) => {
    const formatLabel = item.format === "three-line" ? "三线表" : "普通表格"

    return {
      ...item,
      fileName: createExportFileName(formatLabel, dateToken),
    }
  })
}

function shouldUseRemote(preferRemote: boolean | undefined) {
  if (!preferRemote) {
    return false
  }
  return isToolsApiConfigured()
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

function pickString(source: Record<string, unknown> | null, keys: string[]) {
  if (!source) {
    return ""
  }

  for (const key of keys) {
    const value = source[key]
    if (typeof value === "string" && value.trim()) {
      return value.trim()
    }
  }

  return ""
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim()
      }
      if (item === null || item === undefined) {
        return ""
      }
      return String(item).trim()
    })
    .filter((item) => item.length > 0)
}

function toHeaders(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  if (value.length === 0) {
    return []
  }

  if (typeof value[0] === "string") {
    return toStringArray(value)
  }

  return value
    .map((item) => {
      const record = toRecord(item)
      if (!record) {
        return ""
      }
      return pickString(record, ["label", "name", "title", "key", "字段"]) || ""
    })
    .filter((item) => item.length > 0)
}

function inferHeadersFromRecordRows(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  const firstRecord = value.find((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return false
    }
    return Object.keys(item as Record<string, unknown>).length > 0
  })

  if (!firstRecord || typeof firstRecord !== "object" || Array.isArray(firstRecord)) {
    return []
  }

  return Object.keys(firstRecord as Record<string, unknown>)
    .map((key) => key.trim())
    .filter(Boolean)
}

function toRows(value: unknown, headers: string[]) {
  if (!Array.isArray(value)) {
    return []
  }

  if (value.length === 0) {
    return []
  }

  if (Array.isArray(value[0])) {
    return value.map((row) => {
      if (!Array.isArray(row)) {
        return []
      }
      return row.map((cell) => {
        if (typeof cell === "string") {
          return cell.trim()
        }
        if (cell === null || cell === undefined) {
          return ""
        }
        return String(cell).trim()
      })
    })
  }

  return value.map((row) => {
    const record = toRecord(row)
    if (!record) {
      return []
    }

    return headers.map((header, index) => {
      const hit =
        record[header] ??
        record[String(index)] ??
        record[`col${index + 1}`] ??
        record[`column${index + 1}`]

      if (typeof hit === "string") {
        return hit.trim()
      }
      if (hit === null || hit === undefined) {
        return ""
      }
      return String(hit).trim()
    })
  })
}

function extractDocument(value: unknown): WordTableDocument | null {
  const source = toRecord(value)
  if (!source) {
    return null
  }

  const nested =
    toRecord(source.document) || toRecord(source.table) || toRecord(source.data) || source

  const rowsSource =
    nested.rows ||
    nested.body ||
    nested.dataRows ||
    nested.records ||
    nested.items

  const parsedHeaders =
    toHeaders(
      nested.headers ||
        nested.columns ||
        nested.header ||
        nested.colHeaders ||
        nested.fields
    ) || []
  const headers =
    parsedHeaders.length > 0
      ? parsedHeaders
      : inferHeadersFromRecordRows(rowsSource)

  const rows =
    toRows(rowsSource, headers) || []

  if (headers.length === 0 && rows.length === 0) {
    return null
  }

  const title =
    pickString(nested, ["title", "name", "tableTitle", "docTitle", "表格标题"]) ||
    pickString(source, ["title", "name", "tableTitle", "表格标题"])

  return normalizeWordTableDocument(
    {
      title,
      headers,
      rows,
      borderProfile: toRecord(nested.borderProfile) as
        | Partial<WordTableDocument["borderProfile"]>
        | undefined,
    },
    createDefaultWordTableDocument()
  )
}

function extractRemoteGenerateResponse(
  value: unknown
): WordTableGenerateResponse | null {
  const validatedRoot = wordTableRemoteGenerateSchema.safeParse(value)
  if (!validatedRoot.success) {
    return null
  }

  const root = toRecord(validatedRoot.data)
  if (!root) {
    return null
  }

  const data = toRecord(root.data)
  const version = readSchemaVersion(data) || readSchemaVersion(root)
  const versionNotice = composeVersionNotice(version)
  const messageSource = data || root

  const rootDocument =
    extractDocument(root.document) ||
    extractDocument(root.table) ||
    extractDocument(root.data) ||
    extractDocument(root)

  if (!rootDocument) {
    return null
  }

  return {
    document: rootDocument,
    source: "remote",
    message: composeNoticeMessage(
      pickString(messageSource, ["message", "msg"]) || toolApiCopy.remoteGenerateDone,
      versionNotice
    ),
  }
}

function buildLocalGenerateResponse(
  request: WordTableGenerateRequest
): WordTableGenerateResponse {
  const document =
    request.mode === "manual" && request.manual
      ? normalizeWordTableDocument(request.manual, createDefaultWordTableDocument())
      : createWordTableDocumentFromPrompt(request.aiPrompt?.trim() || "")

  return {
    document,
    source: "local",
    message: toolApiCopy.localGenerateDone,
  }
}

export async function generateWordTableData(
  request: WordTableGenerateRequest,
  options: WordTableActionOptions = {}
): Promise<WordTableGenerateResponse> {
  let fallbackNotice = ""

  if (shouldUseRemote(options.preferRemote)) {
    try {
      const remoteRawResponse = await toolsApiClient.request<
        unknown,
        WordTableGenerateRequest
      >(toolsApiEndpoints.wordTable.generate, {
        method: "POST",
        body: request,
        signal: options.signal,
      })

      const remoteResponse = extractRemoteGenerateResponse(remoteRawResponse)
      if (remoteResponse) {
        return remoteResponse
      }

      fallbackNotice = buildToolApiInvalidPayloadFallbackNotice({
        fallbackTarget: "本地生成",
      })
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        throw error
      }

      if (error instanceof ToolApiError) {
        fallbackNotice = buildToolApiFallbackNotice({
          status: error.status,
          details: error.details,
          fallbackTarget: "本地生成",
        })
      } else {
        fallbackNotice = buildToolApiFallbackNotice({
          status: -1,
          fallbackTarget: "本地生成",
        })
      }
    }
  }

  const localResult = buildLocalGenerateResponse(request)
  return {
    ...localResult,
    message: composeNoticeMessage(
      localResult.message || toolApiCopy.localGenerateDone,
      fallbackNotice
    ),
  }
}

export async function exportWordTableWord(
  request: WordTableExportRequest,
  options: WordTableActionOptions = {}
): Promise<WordTableExportResult> {
  void options
  const dateToken = createExportDateToken()
  const documents = applyExportFileNames(createWordTableWordBlobs(request), dateToken)

  return {
    documents,
    source: "local",
    fileFormat: "doc",
    message: `${toolApiCopy.wordExportSuccess}（已生成普通表格与三线表两份文档）`,
  }
}
