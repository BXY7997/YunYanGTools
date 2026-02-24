import {
  isToolsApiConfigured,
  toolsApiEndpoints,
} from "@/features/tools/shared/constants/api-config"
import {
  ToolApiError,
  toolsApiClient,
} from "@/features/tools/shared/services/tool-api-client"
import { parseSqlSchemaToTables } from "@/features/tools/sql-to-table/services/sql-schema-parser"
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
}

interface SqlToTableRemoteGenerateEnvelope {
  code?: number
  msg?: string
  message?: string
  data?: SqlToTableRemoteGenerateResponse
}

interface SqlToTableActionOptions {
  preferRemote?: boolean
  signal?: AbortSignal
}

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

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

function extractRemoteGenerateResponse(
  value: unknown
): SqlToTableRemoteGenerateResponse | null {
  const root = toRecord(value)
  if (!root) {
    return null
  }

  if (Array.isArray(root.tables)) {
    return {
      tables: root.tables as SqlToTableGenerateResponse["tables"],
      message:
        typeof root.message === "string" ? root.message : undefined,
    }
  }

  const envelope = root as SqlToTableRemoteGenerateEnvelope
  const payload = toRecord(envelope.data)
  if (payload && Array.isArray(payload.tables)) {
    const fallbackMessage =
      typeof envelope.msg === "string"
        ? envelope.msg
        : typeof envelope.message === "string"
        ? envelope.message
        : undefined

    return {
      tables: payload.tables as SqlToTableGenerateResponse["tables"],
      message:
        typeof payload.message === "string"
          ? payload.message
          : fallbackMessage,
    }
  }

  return null
}

export async function generateSqlToTableData(
  request: SqlToTableGenerateRequest,
  options: SqlToTableActionOptions = {}
): Promise<SqlToTableGenerateResponse> {
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
      if (remoteResponse) {
        return {
          tables: remoteResponse.tables,
          source: "remote",
          message: remoteResponse.message,
        }
      }
    } catch (error) {
      if (error instanceof ToolApiError && error.status === 0) {
        throw error
      }
    }
  }

  const tables = parseSqlSchemaToTables(request.input)
  return {
    tables,
    source: "local",
    message: tables.length > 0 ? "本地解析完成" : "未识别到可解析的表结构",
  }
}

export async function exportSqlToTableWord(
  request: SqlToTableExportRequest,
  options: SqlToTableActionOptions = {}
): Promise<SqlToTableExportResult> {
  if (shouldUseRemote(options.preferRemote)) {
    try {
      const remoteBlob = await toolsApiClient.request<Blob, SqlToTableExportRequest>(
        toolsApiEndpoints.sqlToTable.exportWord,
        {
          method: "POST",
          body: request,
          signal: options.signal,
          responseType: "blob",
        }
      )

      return {
        blob: remoteBlob,
        fileName: createExportFileName(),
        source: "remote",
      }
    } catch {
      // Fall through to local export to keep the tool available offline.
    }
  }

  return {
    blob: createSqlToTableWordBlob(request),
    fileName: createExportFileName(),
    source: "local",
  }
}
