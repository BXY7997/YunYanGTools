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
  pseudoCodeDefaultPrompt,
  pseudoCodeDefaultRenderConfig,
} from "@/features/tools/pseudo-code/constants/pseudo-code-config"
import {
  createPseudoCodeDocumentFromPrompt,
  createPseudoCodeDocumentFromSource,
  resolveRenderConfig,
} from "@/features/tools/pseudo-code/services/pseudo-code-engine"
import {
  createPseudoCodeExportFileName,
  createPseudoCodePngBlob,
  createPseudoCodeWordFileName,
  createPseudoCodeSvgBlob,
} from "@/features/tools/pseudo-code/services/pseudo-code-export"
import { createPseudoCodeWordBlob } from "@/features/tools/pseudo-code/services/pseudo-code-word-export"
import type {
  PseudoCodeDocument,
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

const remotePseudoCodeSchema = z
  .object({
    version: z.string().trim().min(1).optional(),
    msg: z.string().optional(),
    message: z.string().optional(),
    data: z.unknown().optional(),
    result: z.unknown().optional(),
    content: z.unknown().optional(),
    code: z.unknown().optional(),
  })
  .passthrough()

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

function pickBoolean(source: Record<string, unknown> | null, keys: string[]) {
  if (!source) {
    return undefined
  }

  for (const key of keys) {
    const value = source[key]
    if (typeof value === "boolean") {
      return value
    }
  }

  return undefined
}

function pickNumber(source: Record<string, unknown> | null, keys: string[]) {
  if (!source) {
    return undefined
  }

  for (const key of keys) {
    const value = source[key]
    const candidate =
      typeof value === "number"
        ? value
        : typeof value === "string"
          ? Number(value.trim())
          : NaN

    if (Number.isFinite(candidate)) {
      return candidate
    }
  }

  return undefined
}

function extractRemoteDocument(value: unknown): PseudoCodeGenerateResponse | null {
  const validated = remotePseudoCodeSchema.safeParse(value)
  if (!validated.success) {
    return null
  }

  const root = toRecord(validated.data)
  if (!root) {
    return null
  }

  const data =
    toRecord(root.data) || toRecord(root.result) || toRecord(root.content) || root

  const payload =
    toRecord(data?.result) ||
    toRecord(data?.content) ||
    toRecord(data?.code) ||
    data

  const sourceText = pickString(payload, [
    "source",
    "content",
    "code",
    "pseudoCode",
    "pseudocode",
    "text",
  ])

  if (!sourceText) {
    return null
  }

  const renderConfig = resolveRenderConfig({
    showLineNumber: pickBoolean(payload, ["showLineNumber", "show_line_number"]),
    hideEndKeywords: pickBoolean(payload, ["hideEndKeywords", "hide_end_keywords"]),
    lineNumberPunc: pickString(payload, ["lineNumberPunc", "line_number_punc"]),
    indentSize: pickNumber(payload, ["indentSize", "indent_size"]),
    titlePrefix: pickString(payload, ["titlePrefix", "title_prefix"]),
    titleCounter: pickNumber(payload, ["titleCounter", "title_counter"]),
    commentDelimiter: pickString(payload, ["commentDelimiter", "comment_delimiter"]),
    theme: pickString(payload, ["theme"])
      ? (pickString(payload, ["theme"]) as PseudoCodeDocument["renderConfig"]["theme"])
      : undefined,
  })

  const document = createPseudoCodeDocumentFromSource({
    source: sourceText,
    algorithmName: pickString(payload, ["algorithmName", "name", "title"]),
    renderConfig,
  })

  const versionNotice = composeVersionNotice(
    readSchemaVersion(payload) || readSchemaVersion(data) || readSchemaVersion(root)
  )

  return {
    document,
    source: "remote",
    message: composeNoticeMessage(
      pickString(payload, ["message", "msg"]) ||
        pickString(data, ["message", "msg"]) ||
        toolApiCopy.remoteGenerateDone,
      versionNotice
    ),
  }
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

  if (shouldUseRemote(options.preferRemote)) {
    try {
      const remoteRawResponse = await toolsApiClient.request<unknown, PseudoCodeGenerateRequest>(
        toolsApiEndpoints.pseudoCode.generate,
        {
          method: "POST",
          body: request,
          signal: options.signal,
        }
      )

      const remoteResponse = extractRemoteDocument(remoteRawResponse)
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
    blob: createPseudoCodeWordBlob(request),
    fileName: resolvedFileName,
    source: "local",
    message: toolApiCopy.wordExportSuccess,
  }
}

export const pseudoCodeDefaultRuntimeConfig = pseudoCodeDefaultRenderConfig
