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
  buildUseCaseDocLocalGenerateResponse,
  buildUseCaseDocLocalTestDataResult,
  extractUseCaseDocRemoteGenerateResponse,
  extractUseCaseDocRemoteTestDataResponse,
} from "@/features/tools/use-case-doc/services/use-case-doc-contract"
import {
  createUseCaseDocWordBlob,
} from "@/features/tools/use-case-doc/services/use-case-doc-word-export"
import type {
  UseCaseDocExportRequest,
  UseCaseDocExportResult,
  UseCaseDocGenerateRequest,
  UseCaseDocGenerateResponse,
  UseCaseDocTestDataResult,
} from "@/features/tools/use-case-doc/types/use-case-doc"

interface UseCaseDocActionOptions {
  preferRemote?: boolean
  signal?: AbortSignal
}

export async function fetchUseCaseDocTestData(
  options: UseCaseDocActionOptions = {}
): Promise<UseCaseDocTestDataResult> {
  let fallbackNotice = ""

  if (shouldUseToolRemote(options.preferRemote)) {
    try {
      const remoteRawResponse = await toolsApiClient.request<unknown>(
        toolsApiEndpoints.useCaseDoc.testData,
        {
          method: "GET",
          signal: options.signal,
        }
      )
      const remoteResponse =
        extractUseCaseDocRemoteTestDataResponse(remoteRawResponse)
      if (remoteResponse) {
        return remoteResponse
      }

      fallbackNotice = buildToolApiInvalidPayloadFallbackNotice({
        subject: "远程测试数据结构异常",
        fallbackTarget: "本地示例",
      })
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        throw error
      }

      if (error instanceof ToolApiError) {
        fallbackNotice = buildToolApiFallbackNotice({
          subject: "远程测试数据",
          status: error.status,
          details: error.details,
          fallbackTarget: "本地示例",
        })
      } else {
        fallbackNotice = buildToolApiFallbackNotice({
          subject: "远程测试数据",
          status: -1,
          fallbackTarget: "本地示例",
        })
      }
    }
  }

  return buildUseCaseDocLocalTestDataResult(fallbackNotice)
}

export async function generateUseCaseDocData(
  request: UseCaseDocGenerateRequest,
  options: UseCaseDocActionOptions = {}
): Promise<UseCaseDocGenerateResponse> {
  let fallbackNotice = ""

  if (shouldUseToolRemote(options.preferRemote)) {
    try {
      const remoteRawResponse = await toolsApiClient.request<
        unknown,
        UseCaseDocGenerateRequest
      >(toolsApiEndpoints.useCaseDoc.generate, {
        method: "POST",
        body: request,
        signal: options.signal,
      })

      const remoteResponse =
        extractUseCaseDocRemoteGenerateResponse(remoteRawResponse)
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

  const localResult = buildUseCaseDocLocalGenerateResponse(request)
  return {
    ...localResult,
    message: composeNoticeMessage(
      localResult.message || toolApiCopy.localGenerateDone,
      fallbackNotice || undefined
    ),
  }
}

export async function exportUseCaseDocWord(
  request: UseCaseDocExportRequest,
  options: UseCaseDocActionOptions = {}
): Promise<UseCaseDocExportResult> {
  // Keep export fully deterministic: always use local standardized template.
  // This avoids remote style drift and guarantees consistent output format.
  void options
  return {
    blob: createUseCaseDocWordBlob(request),
    fileName: createToolWordFileName("用例说明文档"),
    source: "local",
    fileFormat: "doc",
    message: toolApiCopy.wordExportSuccess,
  }
}
