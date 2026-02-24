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
  composeVersionNotice,
  toolApiEnvelopeSchema,
} from "@/features/tools/shared/services/tool-api-schema"
import {
  ToolApiError,
  toolsApiClient,
} from "@/features/tools/shared/services/tool-api-client"
import { parseSqlSchemaToTablesWithWorker } from "@/features/tools/sql-to-table/services/sql-schema-worker"
import {
  createSqlToTableWordBlob,
} from "@/features/tools/sql-to-table/services/sql-to-table-word-export"
import type {
  SqlToTableExportRequest,
  SqlToTableExportResult,
  SqlToTableGenerateRequest,
  SqlToTableGenerateResponse,
} from "@/features/tools/sql-to-table/types/sql-to-table"

interface SqlToTableRemoteGenerateResponse {
  tables: SqlToTableGenerateResponse["tables"]
  message?: string
  version?: string
}

interface SqlToTableActionOptions {
  preferRemote?: boolean
  signal?: AbortSignal
}

const remoteColumnSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    name: z.string().trim().min(1),
    type: z.string().trim().min(1),
    length: z.union([z.string(), z.number()]).optional(),
    isPrimary: z.union([z.boolean(), z.number(), z.string()]).optional(),
    constraint: z.union([z.string(), z.number()]).optional(),
    remark: z.union([z.string(), z.number()]).optional(),
    rawDefinition: z.string().optional(),
  })
  .passthrough()

const remoteTableSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    name: z.string().trim().min(1),
    displayName: z.string().trim().optional(),
    comment: z.union([z.string(), z.number()]).optional(),
    columns: z.array(remoteColumnSchema),
  })
  .passthrough()

const remoteGeneratePayloadSchema = z
  .object({
    version: z.string().trim().min(1).optional(),
    message: z.string().optional(),
    tables: z.array(remoteTableSchema),
  })
  .passthrough()

function createExportFileName() {
  const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  const dateToken = dateFormatter.format(new Date()).replace(/\//g, "-")
  return `SQL三线表-${dateToken}.doc`
}

function shouldUseRemote(preferRemote: boolean | undefined) {
  if (!preferRemote) {
    return false
  }
  return isToolsApiConfigured()
}

function normalizeText(value: unknown) {
  if (value === null || value === undefined) {
    return ""
  }
  return String(value).trim()
}

function normalizeBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value
  }
  if (typeof value === "number") {
    return value === 1
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    if (!normalized) {
      return false
    }
    return ["1", "true", "yes", "y", "pk", "primary", "主键", "是"].includes(
      normalized
    )
  }
  return false
}

function normalizeRemoteTables(
  tables: z.infer<typeof remoteTableSchema>[]
): SqlToTableGenerateResponse["tables"] {
  return tables.map((table, tableIndex) => {
    const tableName = table.name.trim()
    const comment = normalizeText(table.comment)
    const displayName = table.displayName?.trim() || comment || tableName

    return {
      id: normalizeText(table.id) || `table-${tableName}-${tableIndex + 1}`,
      name: tableName,
      displayName,
      comment: comment || undefined,
      columns: table.columns.map((column, columnIndex) => {
        const columnName = column.name.trim()
        return {
          id:
            normalizeText(column.id) ||
            `${tableName}-${columnName}-${columnIndex + 1}`,
          name: columnName,
          type: column.type.trim(),
          length: normalizeText(column.length) || undefined,
          isPrimary: normalizeBoolean(column.isPrimary),
          constraint: normalizeText(column.constraint) || undefined,
          remark: normalizeText(column.remark) || undefined,
          rawDefinition: column.rawDefinition?.trim(),
        }
      }),
    }
  })
}

function extractRemoteGenerateResponse(
  value: unknown
): SqlToTableRemoteGenerateResponse | null {
  const directPayloadResult = remoteGeneratePayloadSchema.safeParse(value)
  if (directPayloadResult.success) {
    const payload = directPayloadResult.data
    const versionNotice = composeVersionNotice(payload.version)
    const baseMessage = payload.message || toolApiCopy.remoteParseDone
    return {
      tables: normalizeRemoteTables(payload.tables),
      message: composeNoticeMessage(baseMessage, versionNotice),
      version: payload.version,
    }
  }

  const envelopeResult = toolApiEnvelopeSchema.safeParse(value)
  if (!envelopeResult.success) {
    return null
  }

  const envelope = envelopeResult.data
  const payloadResult = remoteGeneratePayloadSchema.safeParse(envelope.data)
  if (!payloadResult.success) {
    return null
  }

  const payload = payloadResult.data
  const version = payload.version || envelope.version
  const baseMessage =
    payload.message || envelope.msg || envelope.message || toolApiCopy.remoteParseDone
  return {
    tables: normalizeRemoteTables(payload.tables),
    message: composeNoticeMessage(baseMessage, composeVersionNotice(version)),
    version,
  }
}

export async function generateSqlToTableData(
  request: SqlToTableGenerateRequest,
  options: SqlToTableActionOptions = {}
): Promise<SqlToTableGenerateResponse> {
  let fallbackNotice = ""

  if (shouldUseRemote(options.preferRemote)) {
    try {
      const remoteRawResponse = await toolsApiClient.request<
        unknown,
        SqlToTableGenerateRequest
      >(toolsApiEndpoints.sqlToTable.generate, {
        method: "POST",
        body: request,
        signal: options.signal,
      })

      const remoteResponse = extractRemoteGenerateResponse(remoteRawResponse)
      if (remoteResponse && Array.isArray(remoteResponse.tables)) {
        return {
          tables: remoteResponse.tables,
          source: "remote",
          message: remoteResponse.message,
        }
      }

      fallbackNotice = buildToolApiInvalidPayloadFallbackNotice({
        fallbackTarget: "本地解析",
      })
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        throw error
      }

      if (error instanceof ToolApiError) {
        fallbackNotice = buildToolApiFallbackNotice({
          status: error.status,
          details: error.details,
          fallbackTarget: "本地解析",
        })
      } else {
        fallbackNotice = buildToolApiFallbackNotice({
          status: -1,
          fallbackTarget: "本地解析",
        })
      }
    }
  }

  const tables = await parseSqlSchemaToTablesWithWorker(request.input)
  const baseMessage =
    tables.length > 0 ? toolApiCopy.localParseDone : toolApiCopy.localParseEmpty
  return {
    tables,
    source: "local",
    message: composeNoticeMessage(baseMessage, fallbackNotice || undefined),
  }
}

export async function exportSqlToTableWord(
  request: SqlToTableExportRequest,
  options: SqlToTableActionOptions = {}
): Promise<SqlToTableExportResult> {
  // Keep export deterministic: always use local standardized template.
  // This avoids remote style differences and keeps all formats consistent.
  void options
  return {
    blob: createSqlToTableWordBlob(request),
    fileName: createExportFileName(),
    source: "local",
    fileFormat: "doc",
    message: toolApiCopy.wordExportSuccess,
  }
}
