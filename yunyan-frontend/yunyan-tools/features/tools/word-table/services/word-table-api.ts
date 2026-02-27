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
  ToolApiError,
  toolsApiClient,
} from "@/features/tools/shared/services/tool-api-client"
import {
  createToolExportDateToken,
  shouldUseToolRemote,
} from "@/features/tools/shared/services/tool-api-runtime"
import {
  createWordTableDocumentFromPrompt,
  createDefaultWordTableDocument,
  normalizeWordTableDocument,
} from "@/features/tools/word-table/services/word-table-model"
import { createWordTableWordBlobs } from "@/features/tools/word-table/services/word-table-word-export"
import { extractWordTableRemoteGenerateResponse } from "@/features/tools/word-table/services/word-table-contract"
import type {
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

  if (shouldUseToolRemote(options.preferRemote)) {
    try {
      const remoteRawResponse = await toolsApiClient.request<
        unknown,
        WordTableGenerateRequest
      >(toolsApiEndpoints.wordTable.generate, {
        method: "POST",
        body: request,
        signal: options.signal,
      })

      const remoteResponse =
        extractWordTableRemoteGenerateResponse(remoteRawResponse)
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
  const dateToken = createToolExportDateToken()
  const documents = applyExportFileNames(createWordTableWordBlobs(request), dateToken)

  return {
    documents,
    source: "local",
    fileFormat: "doc",
    message: `${toolApiCopy.wordExportSuccess}（已生成普通表格与三线表两份文档）`,
  }
}
