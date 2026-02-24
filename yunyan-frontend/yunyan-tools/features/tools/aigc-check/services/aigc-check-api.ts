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
import { createAigcCheckReportBlob } from "@/features/tools/aigc-check/services/aigc-check-report-export"
import {
  aigcCheckDefaultContent,
  aigcCheckDefaultTitle,
} from "@/features/tools/aigc-check/constants/aigc-check-config"
import type {
  AigcCheckExportRequest,
  AigcCheckExportResult,
  AigcCheckGenerateRequest,
  AigcCheckGenerateResponse,
  AigcCheckResult,
  AigcSentenceRiskItem,
} from "@/features/tools/aigc-check/types/aigc-check"

interface AigcCheckActionOptions {
  preferRemote?: boolean
  signal?: AbortSignal
}

const remoteDetectSchema = z
  .object({
    version: z.string().trim().min(1).optional(),
    msg: z.string().optional(),
    message: z.string().optional(),
    data: z.unknown().optional(),
    result: z.unknown().optional(),
    report: z.unknown().optional(),
    aiProbability: z.unknown().optional(),
    aiRate: z.unknown().optional(),
    aigcRate: z.unknown().optional(),
  })
  .passthrough()

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
  return `AIGC检测报告-${dateToken}.doc`
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

function normalizePercent(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback
  }
  return Math.min(100, Math.max(0, Number(value)))
}

function normalizeWordCount(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback
  }
  return Math.max(0, Math.round(Number(value)))
}

function normalizeSentenceText(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

function normalizeContentText(value: string | undefined) {
  if (!value) {
    return ""
  }
  return value
    .replace(/\r/g, "\n")
    .replace(/\u3000/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function splitSentences(content: string) {
  const normalized = normalizeContentText(content)
  if (!normalized) {
    return []
  }

  return normalized
    .split(/(?<=[。！？!?；;])\s*|\n+/)
    .map((item) => normalizeSentenceText(item))
    .filter(Boolean)
}

const highRiskPhrases = [
  "通过实验结果可以看出",
  "综上所述",
  "由此可见",
  "本文主要",
  "本研究",
  "本系统",
  "显著提升",
  "有效验证",
]

const mediumRiskPhrases = [
  "采用",
  "实现",
  "优化",
  "提高",
  "设计",
  "构建",
  "能够",
  "因此",
]

function resolveRiskLevel(score: number): AigcSentenceRiskItem["level"] {
  if (score >= 60) {
    return "high"
  }
  if (score >= 40) {
    return "medium"
  }
  return "low"
}

function scoreSentence(sentence: string, index: number): AigcSentenceRiskItem {
  const normalized = normalizeSentenceText(sentence)
  const lengthScore = Math.min(24, normalized.length * 0.35)
  const punctuationPenalty = /[:：()（）]/.test(normalized) ? -4 : 0
  const numberPenalty = /\d/.test(normalized) ? -6 : 0

  const hitHigh = highRiskPhrases.filter((item) => normalized.includes(item))
  const hitMedium = mediumRiskPhrases.filter((item) => normalized.includes(item))

  const highScore = hitHigh.length * 18
  const mediumScore = Math.min(3, hitMedium.length) * 6

  const score = Math.round(
    Math.min(95, Math.max(8, 18 + lengthScore + highScore + mediumScore + punctuationPenalty + numberPenalty))
  )

  const signals = [
    ...(hitHigh.length ? ["模板化结论表达"] : []),
    ...(hitMedium.length >= 4 ? ["高频学术动词堆叠"] : []),
    ...(normalized.length > 38 ? ["长句复合结构"] : []),
  ]

  if (!signals.length) {
    signals.push("表达自然")
  }

  return {
    id: `S${index + 1}`,
    text: normalized,
    aiProbability: score,
    level: resolveRiskLevel(score),
    signals,
  }
}

function calculateOverallProbability(sentenceScores: AigcSentenceRiskItem[], content: string) {
  if (!sentenceScores.length) {
    return 34
  }

  const avg =
    sentenceScores.reduce((sum, item) => sum + item.aiProbability, 0) /
    sentenceScores.length

  const words = normalizeContentText(content)
    .replace(/[，。！？；：,.!?;:\s]/g, "")
    .split("")
  const uniqueCount = new Set(words).size
  const lexicalPenalty = words.length > 0 ? ((words.length - uniqueCount) / words.length) * 24 : 0

  return Math.round(Math.min(92, Math.max(6, avg * 0.78 + lexicalPenalty)))
}

function buildSuggestions(aiProbability: number, risks: AigcSentenceRiskItem[]) {
  const suggestions: string[] = []

  if (aiProbability >= 60) {
    suggestions.push("优先改写高风险句，减少“综上所述/由此可见”等模板化结论。")
  }

  if (risks.some((item) => item.level === "high")) {
    suggestions.push("为高风险句补充实验数据、错误样例或参数依据，增强个体表达。")
  }

  if (risks.length >= 4) {
    suggestions.push("打散连续概述段落，穿插过程细节和反思内容，降低自动生成特征。")
  }

  if (!suggestions.length) {
    suggestions.push("文本整体风险较低，建议继续补充细节论证以保持稳定表现。")
  }

  return suggestions
}

function buildSummary(aiProbability: number) {
  if (aiProbability >= 70) {
    return "检测到较高 AI 生成痕迹，建议针对句级高风险区域优先改写。"
  }
  if (aiProbability >= 45) {
    return "文本存在中等 AI 痕迹，建议补充过程细节并调整模板化表达。"
  }
  return "文本整体风险较低，建议继续保持个人化论证与数据细节。"
}

function buildLocalResult(request: AigcCheckGenerateRequest): AigcCheckResult {
  const title = (request.title || aigcCheckDefaultTitle).trim() || "未命名文档"
  const content =
    request.mode === "file"
      ? `文档文件：${request.file?.name || "未命名文件"}。${aigcCheckDefaultContent}`
      : normalizeContentText(request.content) || aigcCheckDefaultContent

  const sentenceRisks = splitSentences(content)
    .slice(0, 8)
    .map((sentence, index) => scoreSentence(sentence, index))

  const aiProbability = calculateOverallProbability(sentenceRisks, content)
  const humanProbability = Math.max(0, 100 - aiProbability)

  return {
    title,
    aiProbability,
    humanProbability,
    confidence: Math.min(96, Math.max(58, 72 + sentenceRisks.length * 2)),
    wordCount: normalizeContentText(content).replace(/\s+/g, "").length,
    summary: buildSummary(aiProbability),
    suggestions: buildSuggestions(aiProbability, sentenceRisks),
    sentenceRisks,
  }
}

function parseSentenceRisks(value: unknown): AigcSentenceRiskItem[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item, index) => {
      const source = toRecord(item)
      if (!source) {
        return null
      }

      const text = pickString(source, ["text", "sentence", "content", "line"])
      if (!text) {
        return null
      }

      const aiProbability = normalizePercent(
        pickNumber(source, ["aiProbability", "aiRate", "rate", "score"]),
        0
      )
      const rawLevel = pickString(source, ["level", "risk", "riskLevel"]).toLowerCase()
      const level: AigcSentenceRiskItem["level"] =
        rawLevel === "high" || rawLevel.includes("高")
          ? "high"
          : rawLevel === "medium" || rawLevel.includes("中")
            ? "medium"
            : "low"

      const signals = Array.isArray(source.signals)
        ? source.signals
            .map((signal) =>
              typeof signal === "string" ? signal.trim() : String(signal || "").trim()
            )
            .filter(Boolean)
        : []

      return {
        id: pickString(source, ["id", "index"]) || `S${index + 1}`,
        text,
        aiProbability,
        level,
        signals: signals.length > 0 ? signals : ["远程结果未提供触发信号"],
      }
    })
    .filter((item): item is AigcSentenceRiskItem => Boolean(item))
}

function extractRemoteResult(value: unknown): AigcCheckGenerateResponse | null {
  const validated = remoteDetectSchema.safeParse(value)
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
    toRecord(root.report) ||
    root

  const versionNotice = composeVersionNotice(
    readSchemaVersion(data) || readSchemaVersion(root)
  )

  const aiProbability = normalizePercent(
    pickNumber(data, [
      "aiProbability",
      "aiRate",
      "aigcProbability",
      "aigcRate",
      "aigc_rate",
      "rate",
      "score",
    ]),
    NaN
  )

  const hasValidAiProbability = Number.isFinite(aiProbability)
  const sentenceRisks = parseSentenceRisks(
    data?.sentenceRisks || data?.riskSentences || data?.details || data?.list
  )

  if (!hasValidAiProbability && sentenceRisks.length === 0) {
    return null
  }

  const resolvedAiProbability = hasValidAiProbability
    ? aiProbability
    : calculateOverallProbability(sentenceRisks, sentenceRisks.map((item) => item.text).join("。"))

  const humanProbability = normalizePercent(
    pickNumber(data, ["humanProbability", "humanRate", "human_rate"]),
    100 - resolvedAiProbability
  )

  const confidence = normalizePercent(
    pickNumber(data, ["confidence", "confidenceRate", "confidence_score"]),
    82
  )

  const title =
    pickString(data, ["title", "name", "docTitle", "documentTitle"]) ||
    aigcCheckDefaultTitle

  const wordCount = normalizeWordCount(
    pickNumber(data, ["wordCount", "words", "totalWords"]),
    Math.max(0, sentenceRisks.map((item) => item.text).join("").length)
  )

  const summary =
    pickString(data, ["summary", "conclusion", "message", "desc"]) ||
    buildSummary(resolvedAiProbability)

  const suggestionsRaw = data?.suggestions
  const suggestions = Array.isArray(suggestionsRaw)
    ? suggestionsRaw
        .map((item) =>
          typeof item === "string" ? item.trim() : String(item || "").trim()
        )
        .filter(Boolean)
    : buildSuggestions(resolvedAiProbability, sentenceRisks)

  return {
    result: {
      title,
      aiProbability: resolvedAiProbability,
      humanProbability,
      confidence,
      wordCount,
      summary,
      suggestions,
      sentenceRisks,
    },
    source: "remote",
    message: composeNoticeMessage(
      pickString(data, ["message", "msg"]) || toolApiCopy.remoteGenerateDone,
      versionNotice
    ),
  }
}

async function requestRemoteDetect(
  request: AigcCheckGenerateRequest,
  options: AigcCheckActionOptions
) {
  if (request.mode === "file") {
    const formData = new FormData()
    formData.append("mode", "file")
    if (request.file) {
      formData.append("file", request.file)
    }
    if (request.title?.trim()) {
      formData.append("title", request.title.trim())
    }

    return toolsApiClient.request<unknown, FormData>(toolsApiEndpoints.aigcCheck.detect, {
      method: "POST",
      body: formData,
      signal: options.signal,
    })
  }

  return toolsApiClient.request<unknown, Omit<AigcCheckGenerateRequest, "file">>(
    toolsApiEndpoints.aigcCheck.detect,
    {
      method: "POST",
      body: {
        mode: "text",
        title: request.title?.trim() || "",
        content: request.content?.trim() || "",
      },
      signal: options.signal,
    }
  )
}

export async function generateAigcCheckData(
  request: AigcCheckGenerateRequest,
  options: AigcCheckActionOptions = {}
): Promise<AigcCheckGenerateResponse> {
  let fallbackNotice = ""

  if (shouldUseRemote(options.preferRemote)) {
    try {
      const remoteRawResponse = await requestRemoteDetect(request, options)
      const remoteResponse = extractRemoteResult(remoteRawResponse)
      if (remoteResponse) {
        return remoteResponse
      }

      fallbackNotice = buildToolApiInvalidPayloadFallbackNotice({
        fallbackTarget: "本地检测",
      })
    } catch (error) {
      if (error instanceof ToolApiError) {
        fallbackNotice = buildToolApiFallbackNotice({
          fallbackTarget: "本地检测",
          status: error.status,
          details: error.details,
        })
      } else {
        fallbackNotice = buildToolApiFallbackNotice({
          fallbackTarget: "本地检测",
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

export async function exportAigcCheckReport(
  request: AigcCheckExportRequest,
  options: AigcCheckActionOptions = {}
): Promise<AigcCheckExportResult> {
  let fallbackNotice = ""

  if (shouldUseRemote(options.preferRemote)) {
    try {
      const remoteBlob = await toolsApiClient.request<Blob, AigcCheckExportRequest>(
        toolsApiEndpoints.aigcCheck.exportReport,
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
    blob: createAigcCheckReportBlob(request),
    fileName: createExportFileName(),
    source: "local",
    fileFormat: "doc",
    message: composeNoticeMessage(toolApiCopy.wordExportSuccess, fallbackNotice),
  }
}
