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
import { shouldUseToolRemote } from "@/features/tools/shared/services/tool-api-runtime"
import {
  pseudoCodeDefaultPrompt,
  pseudoCodeDefaultRenderConfig,
} from "@/features/tools/pseudo-code/constants/pseudo-code-config"
import {
  createPseudoCodeDocumentFromPrompt,
  createPseudoCodeDocumentFromSource,
} from "@/features/tools/pseudo-code/services/pseudo-code-engine"
import {
  createPseudoCodeExportFileName,
  createPseudoCodePngBlob,
  createPseudoCodeWordFileName,
  createPseudoCodeSvgBlob,
} from "@/features/tools/pseudo-code/services/pseudo-code-export"
import { extractPseudoCodeRemoteDocument } from "@/features/tools/pseudo-code/services/pseudo-code-contract"
import { createPseudoCodeWordBlob } from "@/features/tools/pseudo-code/services/pseudo-code-word-export"
import type {
  PseudoCodeExportRequest,
  PseudoCodeExportResult,
  PseudoCodeGenerateRequest,
  PseudoCodeGenerateResponse,
  PseudoCodeWordExportRequest,
  PseudoCodeWordExportResult,
} from "@/features/tools/pseudo-code/types/pseudo-code"

interface PseudoCodeActionOptions {
  preferRemote?: boolean
  signal?: AbortSignal
}

function buildLocalDocument(request: PseudoCodeGenerateRequest) {
  if (request.mode === "manual") {
    return createPseudoCodeDocumentFromSource({
      source: request.manualInput || "",
      algorithmName: request.algorithmName,
      renderConfig: request.renderConfig,
    })
  }

  return createPseudoCodeDocumentFromPrompt({
    prompt: request.aiPrompt || pseudoCodeDefaultPrompt,
    algorithmName: request.algorithmName,
    renderConfig: request.renderConfig,
  })
}

export async function generatePseudoCodeData(
  request: PseudoCodeGenerateRequest,
  options: PseudoCodeActionOptions = {}
): Promise<PseudoCodeGenerateResponse> {
  let fallbackNotice = ""

  if (shouldUseToolRemote(options.preferRemote)) {
    try {
      const remoteRawResponse = await toolsApiClient.request<unknown, PseudoCodeGenerateRequest>(
        toolsApiEndpoints.pseudoCode.generate,
        {
          method: "POST",
          body: request,
          signal: options.signal,
        }
      )

      const remoteResponse = extractPseudoCodeRemoteDocument(remoteRawResponse)
      if (remoteResponse) {
        return remoteResponse
      }

      fallbackNotice = buildToolApiInvalidPayloadFallbackNotice({
        fallbackTarget: "本地伪代码生成",
      })
    } catch (error) {
      if (error instanceof ToolApiError) {
        fallbackNotice = buildToolApiFallbackNotice({
          fallbackTarget: "本地伪代码生成",
          status: error.status,
          details: error.details,
        })
      } else {
        fallbackNotice = buildToolApiFallbackNotice({
          fallbackTarget: "本地伪代码生成",
          status: 0,
        })
      }
    }
  }

  return {
    document: buildLocalDocument(request),
    source: "local",
    message: composeNoticeMessage(toolApiCopy.localGenerateDone, fallbackNotice),
  }
}

export async function exportPseudoCodeImage(
  request: PseudoCodeExportRequest,
  _options: PseudoCodeActionOptions = {}
): Promise<PseudoCodeExportResult> {
  const resolvedFormat = request.exportFormat === "png" ? "png" : "svg"
  const resolvedFileName =
    request.fileName?.trim() ||
    createPseudoCodeExportFileName(request.document.title, resolvedFormat)
  // Keep export deterministic: always use local standardized template.
  const blob =
    resolvedFormat === "png"
      ? await createPseudoCodePngBlob(request.document)
      : await createPseudoCodeSvgBlob(request.document)

  return {
    blob,
    fileName: resolvedFileName,
    source: "local",
    fileFormat: resolvedFormat,
    message: "伪代码图片导出完成",
  }
}

export async function exportPseudoCodeWord(
  request: PseudoCodeWordExportRequest,
  _options: PseudoCodeActionOptions = {}
): Promise<PseudoCodeWordExportResult> {
  const resolvedFileName =
    request.fileName?.trim() || createPseudoCodeWordFileName(request.document.title)
  // Keep export deterministic: always use local standardized template.
  return {
    blob: await createPseudoCodeWordBlob(request),
    fileName: resolvedFileName,
    source: "local",
    message: toolApiCopy.wordExportSuccess,
  }
}

export const pseudoCodeDefaultRuntimeConfig = pseudoCodeDefaultRenderConfig
