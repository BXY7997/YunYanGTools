import {
  toolsApiEndpoints,
} from "@/features/tools/shared/constants/api-config"
import {
  buildToolApiFallbackNotice,
  buildToolApiInvalidPayloadFallbackNotice,
  composeNoticeMessage,
  toolApiCopy,
} from "@/features/tools/shared/constants/tool-copy"
import {
  createToolWordFileName,
  shouldUseToolRemote,
} from "@/features/tools/shared/services/tool-api-runtime"
import {
  ToolApiError,
  toolsApiClient,
} from "@/features/tools/shared/services/tool-api-client"
import { parseSqlSchemaToTablesWithWorker } from "@/features/tools/sql-to-table/services/sql-schema-worker"
import {
  createSqlToTableWordBlob,
} from "@/features/tools/sql-to-table/services/sql-to-table-word-export"
import {
  extractSqlToTableRemoteGenerateResponse,
} from "@/features/tools/sql-to-table/services/sql-to-table-contract"
import type {
  SqlToTableExportRequest,
  SqlToTableExportResult,
  SqlToTableGenerateRequest,
  SqlToTableGenerateResponse,
} from "@/features/tools/sql-to-table/types/sql-to-table"

interface SqlToTableActionOptions {
  preferRemote?: boolean
  signal?: AbortSignal
}

export async function generateSqlToTableData(
  request: SqlToTableGenerateRequest,
  options: SqlToTableActionOptions = {}
): Promise<SqlToTableGenerateResponse> {
  let fallbackNotice = ""

  if (shouldUseToolRemote(options.preferRemote)) {
    try {
      const remoteRawResponse = await toolsApiClient.request<
        unknown,
        SqlToTableGenerateRequest
      >(toolsApiEndpoints.sqlToTable.generate, {
        method: "POST",
        body: request,
        signal: options.signal,
      })

      const remoteResponse =
        extractSqlToTableRemoteGenerateResponse(remoteRawResponse)
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
    fileName: createToolWordFileName(
      request.format === "normal" ? "SQL普通表格" : "SQL三线表"
    ),
    source: "local",
    fileFormat: "doc",
    message: toolApiCopy.wordExportSuccess,
  }
}
