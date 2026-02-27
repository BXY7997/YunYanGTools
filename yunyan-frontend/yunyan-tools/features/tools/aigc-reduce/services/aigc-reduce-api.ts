import { z } from "zod"

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
  composeVersionNotice,
  readSchemaVersion,
} from "@/features/tools/shared/services/tool-api-schema"
import {
  aigcReduceDefaultContent,
  aigcReduceDefaultTitle,
} from "@/features/tools/aigc-reduce/constants/aigc-reduce-config"
import type {
  AigcReduceExportRequest,
  AigcReduceExportResult,
  AigcReduceGenerateRequest,
  AigcReduceGenerateResponse,
  AigcReduceResult,
  AigcReduceSplitMode,
} from "@/features/tools/aigc-reduce/types/aigc-reduce"

interface AigcReduceActionOptions {
  preferRemote?: boolean
  signal?: AbortSignal
}

const remoteReduceSchema = z
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

const highRiskPhrases = [
  "通过实验结果可以看出",
  "综上所述",
  "由此可见",
  "本文主要",
  "本研究",
  "本系统",
  "显著提升",
  "有效验证",
  "能够满足",
]

const rewriteRules: Array<{ from: RegExp; to: string }> = [
  { from: /通过实验结果可以看出/g, to: "结合实验数据可观察到" },
  { from: /综上所述/g, to: "综合以上分析" },
  { from: /由此可见/g, to: "从上述过程可以看出" },
  { from: /本文主要/g, to: "本文重点" },
  { from: /本研究/g, to: "本次研究" },
  { from: /本系统/g, to: "该系统" },
  { from: /显著提升/g, to: "明显提升" },
  { from: /有效验证/g, to: "完成验证" },
  { from: /能够满足/g, to: "可满足" },
]

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

function splitByMode(text: string, splitMode: AigcReduceSplitMode) {
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

function estimateAigcProbability(text: string) {
  const normalized = normalizeText(text)
  if (!normalized) {
    return 32
  }

  let score = 24
  for (const phrase of highRiskPhrases) {
    if (normalized.includes(phrase)) {
      score += 9
    }
  }

  const commaCount = (normalized.match(/[，,]/g) || []).length
  const semicolonCount = (normalized.match(/[；;]/g) || []).length
  score += Math.min(18, Math.round((commaCount + semicolonCount) / 2))

  const sentenceCount = splitByMode(normalized, "sentence").length
  if (sentenceCount > 6) {
    score += 6
  }

  if (/\d/.test(normalized)) {
    score -= 4
  }

  return Math.min(95, Math.max(8, score))
}

function applyRewrite(text: string, splitMode: AigcReduceSplitMode) {
  const segments = splitByMode(text, splitMode)
  if (segments.length === 0) {
    return {
      optimizedText: normalizeText(text),
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
    optimizedText: rewrittenSegments.join(joiner).trim(),
    rewriteCount,
  }
}

function inferSplitMode(value: string): AigcReduceSplitMode {
  const normalized = value.toLowerCase()
  if (normalized === "paragraph" || normalized.includes("段")) {
    return "paragraph"
  }
  return "sentence"
}

function buildLocalResult(request: AigcReduceGenerateRequest): AigcReduceResult {
  const title = (request.title || aigcReduceDefaultTitle).trim() || "未命名文档"
  const splitMode = request.splitMode

  const originalText =
    request.mode === "file"
      ? `文档文件：${request.file?.name || "未命名文件"}。${aigcReduceDefaultContent}`
      : normalizeText(request.content) || aigcReduceDefaultContent

  const rewritten = applyRewrite(originalText, splitMode)
  const beforeProbability = estimateAigcProbability(originalText)
  const afterEstimate = estimateAigcProbability(rewritten.optimizedText)
  const afterProbability = Math.max(
    5,
    Math.min(afterEstimate, beforeProbability - Math.max(8, rewritten.rewriteCount * 2))
  )

  const notes = [
    "已优先替换模板化高风险短语，保留原始业务语义。",
    "建议继续补充实验细节、参数依据和异常处理过程。",
    splitMode === "paragraph"
      ? "当前采用分段改写策略，适合整体风格统一。"
      : "当前采用分句改写策略，适合逐句精细化调整。",
  ]

  return {
    title,
    splitMode,
    originalText,
    optimizedText: rewritten.optimizedText || originalText,
    beforeProbability,
    afterProbability,
    confidence: Math.min(96, Math.max(64, 72 + rewritten.rewriteCount * 2)),
    rewriteCount: rewritten.rewriteCount,
    notes,
  }
}

function extractRemoteResult(value: unknown): AigcReduceGenerateResponse | null {
  const validated = remoteReduceSchema.safeParse(value)
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

  const optimizedText = pickString(resultData, [
    "optimizedText",
    "rewrittenText",
    "rewriteText",
    "content",
    "resultText",
    "text",
  ])

  if (!optimizedText) {
    return null
  }

  const originalText =
    pickString(resultData, ["originalText", "sourceText", "inputText"]) ||
    aigcReduceDefaultContent

  const splitMode = inferSplitMode(
    pickString(resultData, ["splitMode", "segmentationMode", "mode"])
  )

  const beforeProbability = clampPercent(
    pickNumber(resultData, ["beforeProbability", "beforeRate", "originRate", "aigcBefore"]),
    estimateAigcProbability(originalText)
  )

  const fallbackAfter = Math.max(4, beforeProbability - 12)
  const afterProbability = clampPercent(
    pickNumber(resultData, ["afterProbability", "afterRate", "targetRate", "aigcAfter"]),
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
        aigcReduceDefaultTitle,
      splitMode,
      originalText,
      optimizedText,
      beforeProbability,
      afterProbability,
      confidence: clampPercent(
        pickNumber(resultData, ["confidence", "confidenceRate", "confidence_score"]),
        82
      ),
      rewriteCount: clampCount(
        pickNumber(resultData, ["rewriteCount", "rewriteNum", "changes"]),
        Math.max(1, Math.round((beforeProbability - afterProbability) / 4))
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
  request: AigcReduceGenerateRequest,
  options: AigcReduceActionOptions
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

    return toolsApiClient.request<unknown, FormData>(toolsApiEndpoints.aigcReduce.parse, {
      method: "POST",
      body: formData,
      signal: options.signal,
    })
  }

  return toolsApiClient.request<unknown, Omit<AigcReduceGenerateRequest, "file">>(
    toolsApiEndpoints.aigcReduce.parse,
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

export async function generateAigcReduceData(
  request: AigcReduceGenerateRequest,
  options: AigcReduceActionOptions = {}
): Promise<AigcReduceGenerateResponse> {
  let fallbackNotice = ""

  if (shouldUseToolRemote(options.preferRemote)) {
    try {
      const remoteRawResponse = await requestRemoteParse(request, options)
      const remoteResponse = extractRemoteResult(remoteRawResponse)
      if (remoteResponse) {
        return remoteResponse
      }

      fallbackNotice = buildToolApiInvalidPayloadFallbackNotice({
        fallbackTarget: "本地改写",
      })
    } catch (error) {
      if (error instanceof ToolApiError) {
        fallbackNotice = buildToolApiFallbackNotice({
          fallbackTarget: "本地改写",
          status: error.status,
          details: error.details,
        })
      } else {
        fallbackNotice = buildToolApiFallbackNotice({
          fallbackTarget: "本地改写",
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

function createAigcReduceReportBlob(request: AigcReduceExportRequest) {
  const { result } = request
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>AIGC率降低报告</title>
</head>
<body style="font-family: 'Times New Roman', SimSun, serif; line-height: 1.75; font-size: 12pt; margin: 0; padding: 24pt;">
  <h1 style="margin: 0 0 10pt; text-align: center; font-size: 16pt;">AIGC率降低报告</h1>
  <p style="margin: 0 0 8pt;"><strong>文档标题：</strong>${escapeHtml(result.title)}</p>
  <p style="margin: 0 0 8pt;"><strong>分割方式：</strong>${result.splitMode === "paragraph" ? "分段" : "分句"}</p>
  <p style="margin: 0 0 8pt;"><strong>处理前AIGC概率：</strong>${result.beforeProbability.toFixed(1)}%</p>
  <p style="margin: 0 0 8pt;"><strong>处理后AIGC概率：</strong>${result.afterProbability.toFixed(1)}%</p>
  <p style="margin: 0 0 8pt;"><strong>置信度：</strong>${result.confidence.toFixed(1)}%</p>
  <p style="margin: 0 0 12pt;"><strong>改写片段数：</strong>${result.rewriteCount}</p>
  <h2 style="margin: 12pt 0 6pt; font-size: 13pt;">优化后文本</h2>
  <p style="margin: 0 0 12pt; white-space: pre-wrap;">${escapeHtml(result.optimizedText)}</p>
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

export async function exportAigcReduceReport(
  request: AigcReduceExportRequest,
  options: AigcReduceActionOptions = {}
): Promise<AigcReduceExportResult> {
  let fallbackNotice = ""

  if (shouldUseToolRemote(options.preferRemote)) {
    try {
      const remoteBlob = await toolsApiClient.request<Blob, AigcReduceExportRequest>(
        toolsApiEndpoints.aigcReduce.exportReport,
        {
          method: "POST",
          body: request,
          signal: options.signal,
          responseType: "blob",
        }
      )

      return {
        blob: remoteBlob,
        fileName: createToolWordFileName("AIGC率降低报告"),
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
    blob: createAigcReduceReportBlob(request),
    fileName: createToolWordFileName("AIGC率降低报告"),
    source: "local",
    fileFormat: "doc",
    message: composeNoticeMessage(toolApiCopy.wordExportSuccess, fallbackNotice),
  }
}
