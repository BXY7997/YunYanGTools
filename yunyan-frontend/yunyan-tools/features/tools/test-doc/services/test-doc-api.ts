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
  createToolWordFileName,
  shouldUseToolRemote,
} from "@/features/tools/shared/services/tool-api-runtime"
import {
  buildLocalTestDocDocument,
  extractTestDocRemoteGenerateResponse,
} from "@/features/tools/test-doc/services/test-doc-contract"
import { createTestDocWordBlob } from "@/features/tools/test-doc/services/test-doc-word-export"
import type {
  TestDocExportRequest,
  TestDocExportResult,
  TestDocGenerateRequest,
  TestDocGenerateResponse,
} from "@/features/tools/test-doc/types/test-doc"

interface TestDocActionOptions {
  preferRemote?: boolean
  signal?: AbortSignal
}

export async function generateTestDocData(
  request: TestDocGenerateRequest,
  options: TestDocActionOptions = {}
): Promise<TestDocGenerateResponse> {
  let fallbackNotice = ""

  if (shouldUseToolRemote(options.preferRemote)) {
    try {
      const remoteRawResponse = await toolsApiClient.request<
        unknown,
        TestDocGenerateRequest
      >(toolsApiEndpoints.testDoc.generate, {
        method: "POST",
        body: request,
        signal: options.signal,
      })

      const remoteResponse =
        extractTestDocRemoteGenerateResponse(remoteRawResponse)
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

  return {
    document: buildLocalTestDocDocument(request.aiPrompt),
    source: "local",
    message: composeNoticeMessage(
      toolApiCopy.localGenerateDone,
      fallbackNotice || undefined
    ),
  }
}

export async function exportTestDocWord(
  request: TestDocExportRequest,
  options: TestDocActionOptions = {}
): Promise<TestDocExportResult> {
  // Keep export deterministic and style-stable by using local template.
  void options
  return {
    blob: createTestDocWordBlob(request),
    fileName: createToolWordFileName("功能测试文档"),
    source: "local",
    fileFormat: "doc",
    message: toolApiCopy.wordExportSuccess,
  }
}
