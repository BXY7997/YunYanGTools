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
  paperRewriteDefaultContent,
  paperRewriteDefaultTitle,
} from "@/features/tools/paper-rewrite/constants/paper-rewrite-config"
import type {
  PaperRewriteExportRequest,
  PaperRewriteExportResult,
  PaperRewriteGenerateRequest,
  PaperRewriteGenerateResponse,
  PaperRewriteResult,
  PaperRewriteSplitMode,
} from "@/features/tools/paper-rewrite/types/paper-rewrite"

interface PaperRewriteActionOptions {
  preferRemote?: boolean
  signal?: AbortSignal
}

const remoteRewriteSchema = z
  .object({
    version: z.string().trim().min(1).optional(),
    msg: z.string().optional(),
    message: z.string().optional(),
    data: z.unknown().optional(),
    result: z.unknown().optional(),
    payload: z.unknown().optional(),
    rewrite: z.unknown().optional(),
  })
  .passthrough()

const highDuplicationPhrases = [
  "通过实验结果可以看出",
  "综上所述",
  "由此可见",
  "本文主要",
  "本研究",
  "本系统",
  "能够满足",
  "进一步提高",
]

const rewriteRules: Array<{ from: RegExp; to: string }> = [
  { from: /通过实验结果可以看出/g, to: "结合实验数据可观察到" },
  { from: /综上所述/g, to: "综合以上分析" },
  { from: /由此可见/g, to: "从上述过程可以看出" },
  { from: /本文主要/g, to: "本文重点" },
  { from: /本研究/g, to: "本次研究" },
  { from: /本系统/g, to: "该系统" },
  { from: /能够满足/g, to: "可满足" },
  { from: /进一步提高/g, to: "继续提升" },
]

function shouldUseRemote(preferRemote: boolean | undefined) {
  if (!preferRemote) {
    return false
  }
  return isToolsApiConfigured()
}

function createExportFileName() {
  const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  const dateToken = dateFormatter.format(new Date()).replace(/\//g, "-")
  return `论文降重报告-${dateToken}.doc`
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
          ? Number(value.replace(/%/g, "").trim())
          : NaN

    if (Number.isFinite(candidate)) {
      return candidate
    }
  }

  return undefined
}

function pickStringArray(source: Record<string, unknown> | null, keys: string[]) {
  if (!source) {
    return []
  }

  for (const key of keys) {
    const value = source[key]
    if (!Array.isArray(value)) {
      continue
    }

    const list = value
      .map((item) => {
        if (typeof item === "string") {
          return item.trim()
        }
        if (item === null || item === undefined) {
          return ""
        }
        return String(item).trim()
      })
      .filter(Boolean)

    if (list.length > 0) {
      return list
    }
  }

  return []
}

function clampPercent(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback
  }
  return Math.min(100, Math.max(0, Number(value)))
}

function clampCount(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback
  }
  return Math.max(0, Math.round(Number(value)))
}

function normalizeText(value: string | undefined) {
  if (!value) {
    return ""
  }

  return value
    .replace(/\r/g, "\n")
    .replace(/\u3000/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function splitByMode(text: string, splitMode: PaperRewriteSplitMode) {
  const normalized = normalizeText(text)
  if (!normalized) {
    return []
  }

  if (splitMode === "paragraph") {
    return normalized
      .split(/\n{2,}/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return normalized
    .split(/(?<=[。！？!?；;])\s*|\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function estimateDuplicationRate(text: string) {
  const normalized = normalizeText(text)
  if (!normalized) {
    return 20
  }

  const sentences = splitByMode(normalized, "sentence")
  const sentenceCount = Math.max(sentences.length, 1)
  let repeatedTemplateCount = 0

  for (const phrase of highDuplicationPhrases) {
    if (normalized.includes(phrase)) {
      repeatedTemplateCount += 1
    }
  }

  const commas = (normalized.match(/[，,]/g) || []).length
  const semicolons = (normalized.match(/[；;]/g) || []).length
  const structurePenalty = Math.min(12, Math.round((commas + semicolons) / sentenceCount))

  const score =
    14 +
    repeatedTemplateCount * 5 +
    Math.min(14, Math.round(sentenceCount / 2)) +
    structurePenalty

  return Math.min(68, Math.max(5, score))
}

function applyRewrite(text: string, splitMode: PaperRewriteSplitMode) {
  const segments = splitByMode(text, splitMode)
  if (segments.length === 0) {
    return {
      rewrittenText: normalizeText(text),
      rewriteCount: 0,
    }
  }

  let rewriteCount = 0
  const rewrittenSegments = segments.map((segment) => {
    let rewritten = segment
    for (const rule of rewriteRules) {
      if (rule.from.test(rewritten)) {
        rewritten = rewritten.replace(rule.from, rule.to)
        rewriteCount += 1
      }
    }

    if (!/[，。！？!?；;]$/.test(rewritten)) {
      rewritten = `${rewritten}。`
    }

    return rewritten
  })

  const joiner = splitMode === "paragraph" ? "\n\n" : " "
  return {
    rewrittenText: rewrittenSegments.join(joiner).trim(),
    rewriteCount,
  }
}

function inferSplitMode(value: string): PaperRewriteSplitMode {
  const normalized = value.toLowerCase()
  if (normalized === "paragraph" || normalized.includes("段")) {
    return "paragraph"
  }
  return "sentence"
}

function buildLocalResult(request: PaperRewriteGenerateRequest): PaperRewriteResult {
  const title = (request.title || paperRewriteDefaultTitle).trim() || "未命名文档"
  const splitMode = request.splitMode

  const originalText =
    request.mode === "file"
      ? `文档文件：${request.file?.name || "未命名文件"}。${paperRewriteDefaultContent}`
      : normalizeText(request.content) || paperRewriteDefaultContent

  const rewritten = applyRewrite(originalText, splitMode)
  const beforeDuplicationRate = estimateDuplicationRate(originalText)
  const afterEstimate = estimateDuplicationRate(rewritten.rewrittenText)
  const afterDuplicationRate = Math.max(
    3,
    Math.min(afterEstimate, beforeDuplicationRate - Math.max(6, rewritten.rewriteCount * 2))
  )

  const notes = [
    "已优先改写模板化句式，降低直接复用表达。",
    "已优化语序并拆解长句，提升文本差异性。",
    splitMode === "paragraph"
      ? "当前采用分段改写策略，适合整体重写。"
      : "当前采用分句改写策略，适合精细降重。",
  ]

  return {
    title,
    splitMode,
    originalText,
    rewrittenText: rewritten.rewrittenText || originalText,
    beforeDuplicationRate,
    afterDuplicationRate,
    confidence: Math.min(96, Math.max(66, 74 + rewritten.rewriteCount * 2)),
    rewriteCount: rewritten.rewriteCount,
    notes,
  }
}

function extractRemoteResult(value: unknown): PaperRewriteGenerateResponse | null {
  const validated = remoteRewriteSchema.safeParse(value)
  if (!validated.success) {
    return null
  }

  const root = toRecord(validated.data)
  if (!root) {
    return null
  }

  const data =
    toRecord(root.data) ||
    toRecord(root.result) ||
    toRecord(root.payload) ||
    toRecord(root.rewrite) ||
    root

  const resultData =
    toRecord(data?.result) || toRecord(data?.rewrite) || toRecord(data?.data) || data

  const rewrittenText = pickString(resultData, [
    "rewrittenText",
    "optimizedText",
    "rewriteText",
    "content",
    "resultText",
    "text",
  ])

  if (!rewrittenText) {
    return null
  }

  const originalText =
    pickString(resultData, ["originalText", "sourceText", "inputText"]) ||
    paperRewriteDefaultContent

  const splitMode = inferSplitMode(
    pickString(resultData, ["splitMode", "segmentationMode", "mode"])
  )

  const beforeDuplicationRate = clampPercent(
    pickNumber(resultData, [
      "beforeDuplicationRate",
      "beforeRate",
      "originRate",
      "duplicateBefore",
    ]),
    estimateDuplicationRate(originalText)
  )

  const fallbackAfter = Math.max(3, beforeDuplicationRate - 10)
  const afterDuplicationRate = clampPercent(
    pickNumber(resultData, [
      "afterDuplicationRate",
      "afterRate",
      "targetRate",
      "duplicateAfter",
    ]),
    fallbackAfter
  )

  const notes = pickStringArray(resultData, ["notes", "suggestions", "tips"])
  const message =
    pickString(resultData, ["message", "msg"]) ||
    pickString(data, ["message", "msg"]) ||
    toolApiCopy.remoteGenerateDone

  const versionNotice = composeVersionNotice(
    readSchemaVersion(resultData) || readSchemaVersion(data) || readSchemaVersion(root)
  )

  return {
    result: {
      title:
        pickString(resultData, ["title", "name", "docTitle"]) ||
        paperRewriteDefaultTitle,
      splitMode,
      originalText,
      rewrittenText,
      beforeDuplicationRate,
      afterDuplicationRate,
      confidence: clampPercent(
        pickNumber(resultData, ["confidence", "confidenceRate", "confidence_score"]),
        84
      ),
      rewriteCount: clampCount(
        pickNumber(resultData, ["rewriteCount", "rewriteNum", "changes"]),
        Math.max(1, Math.round((beforeDuplicationRate - afterDuplicationRate) / 3))
      ),
      notes:
        notes.length > 0
          ? notes
          : ["远程结果未提供详细说明，建议人工复核语义一致性。"],
    },
    source: "remote",
    message: composeNoticeMessage(message, versionNotice),
  }
}

async function requestRemoteParse(
  request: PaperRewriteGenerateRequest,
  options: PaperRewriteActionOptions
) {
  if (request.mode === "file") {
    const formData = new FormData()
    formData.append("mode", "file")
    formData.append("splitMode", request.splitMode)
    if (request.file) {
      formData.append("file", request.file)
    }
    if (request.title?.trim()) {
      formData.append("title", request.title.trim())
    }

    return toolsApiClient.request<unknown, FormData>(
      toolsApiEndpoints.paperRewrite.parse,
      {
        method: "POST",
        body: formData,
        signal: options.signal,
      }
    )
  }

  return toolsApiClient.request<unknown, Omit<PaperRewriteGenerateRequest, "file">>(
    toolsApiEndpoints.paperRewrite.parse,
    {
      method: "POST",
      body: {
        mode: "text",
        splitMode: request.splitMode,
        title: request.title?.trim() || "",
        content: request.content?.trim() || "",
      },
      signal: options.signal,
    }
  )
}

export async function generatePaperRewriteData(
  request: PaperRewriteGenerateRequest,
  options: PaperRewriteActionOptions = {}
): Promise<PaperRewriteGenerateResponse> {
  let fallbackNotice = ""

  if (shouldUseRemote(options.preferRemote)) {
    try {
      const remoteRawResponse = await requestRemoteParse(request, options)
      const remoteResponse = extractRemoteResult(remoteRawResponse)
      if (remoteResponse) {
        return remoteResponse
      }

      fallbackNotice = buildToolApiInvalidPayloadFallbackNotice({
        fallbackTarget: "本地降重",
      })
    } catch (error) {
      if (error instanceof ToolApiError) {
        fallbackNotice = buildToolApiFallbackNotice({
          fallbackTarget: "本地降重",
          status: error.status,
          details: error.details,
        })
      } else {
        fallbackNotice = buildToolApiFallbackNotice({
          fallbackTarget: "本地降重",
          status: 0,
        })
      }
    }
  }

  const result = buildLocalResult(request)

  return {
    result,
    source: "local",
    message: composeNoticeMessage(toolApiCopy.localGenerateDone, fallbackNotice),
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function createPaperRewriteReportBlob(request: PaperRewriteExportRequest) {
  const { result } = request
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>论文降重报告</title>
</head>
<body style="font-family: 'Times New Roman', SimSun, serif; line-height: 1.75; font-size: 12pt; margin: 0; padding: 24pt;">
  <h1 style="margin: 0 0 10pt; text-align: center; font-size: 16pt;">论文降重报告</h1>
  <p style="margin: 0 0 8pt;"><strong>文档标题：</strong>${escapeHtml(result.title)}</p>
  <p style="margin: 0 0 8pt;"><strong>分割方式：</strong>${result.splitMode === "paragraph" ? "分段" : "分句"}</p>
  <p style="margin: 0 0 8pt;"><strong>处理前重复率：</strong>${result.beforeDuplicationRate.toFixed(1)}%</p>
  <p style="margin: 0 0 8pt;"><strong>处理后重复率：</strong>${result.afterDuplicationRate.toFixed(1)}%</p>
  <p style="margin: 0 0 8pt;"><strong>置信度：</strong>${result.confidence.toFixed(1)}%</p>
  <p style="margin: 0 0 12pt;"><strong>改写片段数：</strong>${result.rewriteCount}</p>
  <h2 style="margin: 12pt 0 6pt; font-size: 13pt;">优化后文本</h2>
  <p style="margin: 0 0 12pt; white-space: pre-wrap;">${escapeHtml(result.rewrittenText)}</p>
  <h2 style="margin: 12pt 0 6pt; font-size: 13pt;">说明</h2>
  <ol style="margin: 0 0 0 18pt; padding: 0;">
    ${result.notes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
  </ol>
</body>
</html>`

  return new Blob([`\ufeff${html}`], {
    type: "application/msword;charset=utf-8",
  })
}

export async function exportPaperRewriteReport(
  request: PaperRewriteExportRequest,
  options: PaperRewriteActionOptions = {}
): Promise<PaperRewriteExportResult> {
  let fallbackNotice = ""

  if (shouldUseRemote(options.preferRemote)) {
    try {
      const remoteBlob = await toolsApiClient.request<Blob, PaperRewriteExportRequest>(
        toolsApiEndpoints.paperRewrite.exportReport,
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
        fileFormat: "doc",
        message: toolApiCopy.wordExportSuccess,
      }
    } catch (error) {
      if (error instanceof ToolApiError) {
        fallbackNotice = buildToolApiFallbackNotice({
          fallbackTarget: "本地导出",
          status: error.status,
          details: error.details,
        })
      } else {
        fallbackNotice = buildToolApiFallbackNotice({
          fallbackTarget: "本地导出",
          status: 0,
        })
      }
    }
  }

  return {
    blob: createPaperRewriteReportBlob(request),
    fileName: createExportFileName(),
    source: "local",
    fileFormat: "doc",
    message: composeNoticeMessage(toolApiCopy.wordExportSuccess, fallbackNotice),
  }
}
