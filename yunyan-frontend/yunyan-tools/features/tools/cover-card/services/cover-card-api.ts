import { z } from "zod"

import {
  coverCardDefaultCapability,
  coverCardPreviewDocument,
} from "@/features/tools/cover-card/constants/cover-card-config"
import { toolsApiEndpoints } from "@/features/tools/shared/constants/api-config"
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
  buildCoverCardVariantsFromPrompt,
  buildCoverCardFromPrompt,
  createCoverCardVariantId,
  createCoverCardVariantLabel,
  isCoverCardThemeId,
  normalizeCoverCardDocument,
} from "@/features/tools/cover-card/services/cover-card-model"
import {
  buildCoverCardRemoteGeneratePayload,
  clampCoverCardVariantCountByCapability,
} from "@/features/tools/cover-card/services/cover-card-request-mapper"
import {
  buildCoverCardImageFileName,
  exportCoverCardImageLocal,
} from "@/features/tools/cover-card/services/cover-card-image-export"
import {
  coverCardPollingStatus,
  looseCapabilitySchema,
  looseCoverCardSchema,
  strictGenerateSchema,
  strictVariantSchema,
} from "@/features/tools/cover-card/services/cover-card-contract"
import type {
  CoverCardCapability,
  CoverCardDocument,
  CoverCardExportRequest,
  CoverCardExportResult,
  CoverCardGenerateMeta,
  CoverCardGenerateRequest,
  CoverCardGenerateResponse,
  CoverCardGenerationConfig,
  CoverCardThemeId,
  CoverCardVariant,
} from "@/features/tools/cover-card/types/cover-card"

interface CoverCardActionOptions {
  preferRemote?: boolean
  signal?: AbortSignal
}

interface CapabilityResult {
  capability: CoverCardCapability
  source: "local" | "remote"
  message?: string
}

interface ParsedVariantsResult {
  variants: CoverCardVariant[]
  selectedVariantId: string
  message: string
}

interface JobEnvelope {
  status: string
  jobId?: string
  message: string
}

let capabilityCache: {
  capability: CoverCardCapability
  expiresAt: number
} | null = null

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
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
    if (typeof value === "number" && Number.isFinite(value)) {
      return value
    }
    if (typeof value === "string") {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }

  return undefined
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
    if (typeof value === "number") {
      return value !== 0
    }
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase()
      if (normalized === "true") {
        return true
      }
      if (normalized === "false") {
        return false
      }
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
    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
    }
    if (typeof value === "string" && value.trim()) {
      return value
        .split(/[，,、；;]/)
        .map((item) => item.trim())
        .filter(Boolean)
    }
  }

  return []
}

function resolveThemeId(
  themeRaw: unknown,
  request: CoverCardGenerateRequest,
  fallbackThemeRaw?: unknown
): CoverCardThemeId {
  if (isCoverCardThemeId(themeRaw)) {
    return themeRaw
  }
  if (isCoverCardThemeId(fallbackThemeRaw)) {
    return fallbackThemeRaw
  }
  if (isCoverCardThemeId(request.themeId)) {
    return request.themeId
  }
  return coverCardPreviewDocument.themeId
}

function buildFallbackDocumentFromPrompt(
  request: CoverCardGenerateRequest,
  config: CoverCardGenerationConfig,
  index: number
) {
  return buildCoverCardFromPrompt({
    prompt: index === 0 ? request.prompt : `${request.prompt}；候选方案 ${index + 1}`,
    ratio: request.ratio,
    width: request.width,
    height: request.height,
    themeId: request.themeId,
  })
}

function buildDocumentFromStrictVariant(
  variant: z.infer<typeof strictVariantSchema>,
  request: CoverCardGenerateRequest,
  config: CoverCardGenerationConfig,
  index: number
): CoverCardDocument {
  const doc = variant.document
  const fallback = buildFallbackDocumentFromPrompt(request, config, index)

  return normalizeCoverCardDocument({
    prompt: request.prompt,
    title: doc.title || fallback.title,
    subtitle: doc.subtitle || fallback.subtitle,
    description: doc.description || fallback.description,
    footer: doc.footer || fallback.footer,
    badges: doc.badges || fallback.badges,
    themeId: resolveThemeId(doc.themeId, request, fallback.themeId),
    ratio: request.ratio,
    width: request.width,
    height: request.height,
  })
}

function extractDocumentFromRecord(
  source: Record<string, unknown> | null,
  request: CoverCardGenerateRequest,
  config: CoverCardGenerationConfig,
  index: number,
  fallbackThemeRaw?: unknown
): CoverCardDocument {
  if (!source) {
    return buildFallbackDocumentFromPrompt(request, config, index)
  }

  const nestedCandidates = [
    source,
    toRecord(source.data),
    toRecord(source.card),
    toRecord(source.document),
    toRecord(source.result),
    toRecord(toRecord(source.data)?.card),
    toRecord(toRecord(source.data)?.document),
    toRecord(toRecord(source.data)?.result),
  ].filter((item): item is Record<string, unknown> => Boolean(item))

  for (const candidate of nestedCandidates) {
    const title = pickString(candidate, ["title", "name", "headline"])
    const subtitle = pickString(candidate, ["subtitle", "subTitle", "sub_title"])
    const description = pickString(candidate, ["description", "summary", "desc", "content"])
    if (!title || !description) {
      continue
    }

    const themeRaw =
      pickString(candidate, ["themeId", "theme", "theme_id"]) ||
      pickString(source, ["themeId", "theme", "theme_id"])

    return normalizeCoverCardDocument({
      prompt: request.prompt,
      title,
      subtitle,
      description,
      footer: pickString(candidate, ["footer", "signature", "meta"]) || "COVER CARD",
      badges: pickStringArray(candidate, ["badges", "tags", "keywords"]),
      themeId: resolveThemeId(themeRaw, request, fallbackThemeRaw),
      ratio: request.ratio,
      width: request.width,
      height: request.height,
    })
  }

  return buildFallbackDocumentFromPrompt(request, config, index)
}

function normalizeStatus(value: unknown) {
  if (typeof value !== "string") {
    return ""
  }
  return value.trim().toLowerCase()
}

function extractJobEnvelope(value: unknown): JobEnvelope | null {
  const parsed = looseCoverCardSchema.safeParse(value)
  if (!parsed.success) {
    return null
  }

  const root = parsed.data
  const rootRecord = toRecord(root)
  const status =
    normalizeStatus(root.status) ||
    normalizeStatus(toRecord(root.data)?.status) ||
    normalizeStatus(toRecord(root.result)?.status)

  const jobId =
    pickString(rootRecord, ["jobId", "job_id"]) ||
    pickString(toRecord(root.data), ["jobId", "job_id"]) ||
    pickString(toRecord(root.result), ["jobId", "job_id"])

  const message =
    pickString(rootRecord, ["message", "msg"]) ||
    pickString(toRecord(root.data), ["message", "msg"]) ||
    pickString(toRecord(root.result), ["message", "msg"])

  if (!status && !jobId) {
    return null
  }

  return {
    status,
    jobId,
    message,
  }
}

function parseVariantsByStrictSchema(
  value: unknown,
  request: CoverCardGenerateRequest,
  config: CoverCardGenerationConfig,
  count: number
): ParsedVariantsResult | null {
  const payloads = [toRecord(value), toRecord(toRecord(value)?.data), toRecord(toRecord(value)?.result)]
    .filter((item): item is Record<string, unknown> => Boolean(item))

  for (const payload of payloads) {
    const parsed = strictGenerateSchema.safeParse(payload)
    if (!parsed.success || !parsed.data.variants || parsed.data.variants.length === 0) {
      continue
    }

    const variants = parsed.data.variants
      .slice(0, count)
      .map((variant, index): CoverCardVariant => {
        const document = buildDocumentFromStrictVariant(variant, request, config, index)
        return {
          id: variant.id || createCoverCardVariantId(index),
          label: variant.label || createCoverCardVariantLabel(index),
          document,
          imageUrl: variant.imageUrl,
          thumbnailUrl: variant.thumbnailUrl,
          seed: variant.seed,
          modelId: variant.modelId || config.modelId,
          latencyMs: variant.latencyMs,
          score: variant.score,
        }
      })

    const selectedVariantId =
      variants.find((item) => item.id === parsed.data.selectedVariantId)?.id ||
      variants[0]?.id ||
      createCoverCardVariantId(0)

    return {
      variants,
      selectedVariantId,
      message: parsed.data.message || "",
    }
  }

  return null
}

function parseVariantsByCompatibilityLayer(
  value: unknown,
  request: CoverCardGenerateRequest,
  config: CoverCardGenerationConfig,
  count: number
): ParsedVariantsResult | null {
  const parsed = looseCoverCardSchema.safeParse(value)
  if (!parsed.success) {
    return null
  }

  const root = parsed.data
  const rootRecord = toRecord(root)

  const candidateArrays = [
    toArray(root.variants),
    toArray(root.cards),
    toArray(root.items),
    toArray(toRecord(root.data)?.variants),
    toArray(toRecord(root.data)?.cards),
    toArray(toRecord(root.data)?.items),
    toArray(toRecord(root.result)?.variants),
    toArray(toRecord(root.result)?.cards),
    toArray(toRecord(root.result)?.items),
  ]

  for (const list of candidateArrays) {
    if (list.length === 0) {
      continue
    }

    const variants = list.slice(0, count).map((item, index): CoverCardVariant => {
      const record = toRecord(item)
      const document = extractDocumentFromRecord(record, request, config, index)
      const id =
        pickString(record, ["id", "variantId", "variant_id", "cardId"]) ||
        createCoverCardVariantId(index)
      const label =
        pickString(record, ["label", "name", "variantName", "variant_name"]) ||
        createCoverCardVariantLabel(index)

      return {
        id,
        label,
        document,
        imageUrl:
          pickString(record, ["imageUrl", "image_url", "url", "image"]) || undefined,
        thumbnailUrl:
          pickString(record, ["thumbnailUrl", "thumbnail_url", "thumb", "thumbUrl"]) ||
          undefined,
        seed: pickNumber(record, ["seed", "seedValue"]),
        modelId: pickString(record, ["modelId", "model_id", "model"]) || config.modelId,
        latencyMs: pickNumber(record, ["latencyMs", "latency_ms", "durationMs"]),
        score: pickNumber(record, ["score", "rankScore"]),
      }
    })

    const selectedRaw =
      pickString(rootRecord, ["selectedVariantId", "selected_variant_id", "selectedId"]) ||
      pickString(toRecord(root.data), ["selectedVariantId", "selected_variant_id", "selectedId"])

    const selectedVariantId =
      variants.find((item) => item.id === selectedRaw)?.id ||
      variants[0]?.id ||
      createCoverCardVariantId(0)

    const message =
      pickString(rootRecord, ["message", "msg"]) ||
      pickString(toRecord(root.data), ["message", "msg"]) ||
      pickString(toRecord(root.result), ["message", "msg"])

    return {
      variants,
      selectedVariantId,
      message,
    }
  }

  const singleDocument = extractDocumentFromRecord(rootRecord, request, config, 0)
  if (!singleDocument.title.trim() || !singleDocument.description.trim()) {
    return null
  }

  return {
    variants: [
      {
        id: createCoverCardVariantId(0),
        label: createCoverCardVariantLabel(0),
        document: singleDocument,
        modelId: config.modelId,
      },
    ],
    selectedVariantId: createCoverCardVariantId(0),
    message:
      pickString(rootRecord, ["message", "msg"]) ||
      pickString(toRecord(root.data), ["message", "msg"]),
  }
}

function extractRemoteVariants(
  value: unknown,
  request: CoverCardGenerateRequest,
  config: CoverCardGenerationConfig,
  count: number
): ParsedVariantsResult | null {
  return (
    parseVariantsByStrictSchema(value, request, config, count) ||
    parseVariantsByCompatibilityLayer(value, request, config, count)
  )
}

function normalizeCapabilityFromRecord(record: Record<string, unknown>) {
  const modelsRaw = toArray(record.models).map((item) => toRecord(item)).filter(Boolean)
  const models = modelsRaw
    .map((item) => {
      const id = pickString(item, ["id", "modelId", "model_id", "name"])
      if (!id) {
        return null
      }
      return {
        id,
        label: pickString(item, ["label", "name", "title"]) || id,
        provider: pickString(item, ["provider", "vendor"]) || "remote",
        description: pickString(item, ["description", "desc"]),
      }
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const capability: CoverCardCapability = {
    models: models.length > 0 ? models : coverCardDefaultCapability.models,
    defaultModelId:
      pickString(record, ["defaultModelId", "default_model_id"]) ||
      coverCardDefaultCapability.defaultModelId,
    maxVariants:
      pickNumber(record, ["maxVariants", "max_variants"]) ||
      coverCardDefaultCapability.maxVariants,
    maxWidth:
      pickNumber(record, ["maxWidth", "max_width"]) || coverCardDefaultCapability.maxWidth,
    maxHeight:
      pickNumber(record, ["maxHeight", "max_height"]) ||
      coverCardDefaultCapability.maxHeight,
    supportedRatios: (pickStringArray(record, ["supportedRatios", "supported_ratios"]) as CoverCardCapability["supportedRatios"]).filter(Boolean),
    supportsJobFlow:
      pickBoolean(record, ["supportsJobFlow", "supports_job_flow"]) ??
      coverCardDefaultCapability.supportsJobFlow,
    pollIntervalMs:
      pickNumber(record, ["pollIntervalMs", "poll_interval_ms"]) ||
      coverCardDefaultCapability.pollIntervalMs,
    maxPollAttempts:
      pickNumber(record, ["maxPollAttempts", "max_poll_attempts"]) ||
      coverCardDefaultCapability.maxPollAttempts,
  }

  capability.maxVariants = Math.max(1, Math.min(4, Math.round(capability.maxVariants)))
  capability.maxWidth = Math.max(200, Math.round(capability.maxWidth))
  capability.maxHeight = Math.max(150, Math.round(capability.maxHeight))
  capability.pollIntervalMs = Math.max(500, Math.round(capability.pollIntervalMs))
  capability.maxPollAttempts = Math.max(3, Math.round(capability.maxPollAttempts))

  if (capability.supportedRatios.length === 0) {
    capability.supportedRatios = coverCardDefaultCapability.supportedRatios
  }

  if (!capability.models.find((item) => item.id === capability.defaultModelId)) {
    capability.defaultModelId = capability.models[0]?.id || coverCardDefaultCapability.defaultModelId
  }

  return capability
}

function parseCapability(value: unknown): CoverCardCapability | null {
  const parsed = looseCapabilitySchema.safeParse(value)
  if (!parsed.success) {
    return null
  }

  const root = parsed.data
  const candidates = [
    toRecord(root),
    toRecord(root.data),
    toRecord(root.result),
  ].filter((item): item is Record<string, unknown> => Boolean(item))

  for (const candidate of candidates) {
    const capability = normalizeCapabilityFromRecord(candidate)
    if (capability.models.length > 0) {
      return capability
    }
  }

  return null
}

function mergeCapabilityWithDefaults(capability: CoverCardCapability) {
  return {
    ...coverCardDefaultCapability,
    ...capability,
    models: capability.models.length > 0 ? capability.models : coverCardDefaultCapability.models,
  }
}

function getNow() {
  return typeof performance !== "undefined" ? performance.now() : Date.now()
}

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      if (signal) {
        signal.removeEventListener("abort", onAbort)
      }
      resolve()
    }, ms)

    const onAbort = () => {
      clearTimeout(timer)
      reject(new DOMException("Aborted", "AbortError"))
    }

    if (signal) {
      signal.addEventListener("abort", onAbort, { once: true })
    }
  })
}

function buildGenerateMeta(params: {
  requestId: string
  configHash: string
  config: CoverCardGenerationConfig
  startAt: number
  capabilitySource: "local" | "remote"
  jobId?: string
  pollCount?: number
  fallbackUsed?: boolean
}): CoverCardGenerateMeta {
  return {
    requestId: params.requestId,
    configHash: params.configHash,
    modelId: params.config.modelId,
    provider: params.config.provider,
    latencyMs: Number((getNow() - params.startAt).toFixed(2)),
    capabilitySource: params.capabilitySource,
    jobId: params.jobId,
    pollCount: params.pollCount,
    fallbackUsed: params.fallbackUsed,
  }
}

function buildLocalVariants(
  request: CoverCardGenerateRequest,
  count: number,
  config: CoverCardGenerationConfig
) {
  const variants = buildCoverCardVariantsFromPrompt({
    prompt: request.prompt,
    ratio: request.ratio,
    width: request.width,
    height: request.height,
    themeId: request.themeId,
    count,
    config,
  })

  return {
    variants,
    selectedVariantId: variants[0]?.id || createCoverCardVariantId(0),
  }
}

async function pollRemoteJobResult(params: {
  jobId: string
  request: CoverCardGenerateRequest
  config: CoverCardGenerationConfig
  count: number
  capability: CoverCardCapability
  signal?: AbortSignal
}): Promise<{ result: ParsedVariantsResult; pollCount: number } | null> {
  const maxPollAttempts = params.capability.maxPollAttempts

  for (let attempt = 1; attempt <= maxPollAttempts; attempt += 1) {
    const response = await toolsApiClient.request<unknown>(toolsApiEndpoints.coverCard.jobStatus, {
      method: "GET",
      query: {
        jobId: params.jobId,
        attempt,
      },
      signal: params.signal,
    })

    const variants = extractRemoteVariants(response, params.request, params.config, params.count)
    if (variants && variants.variants.length > 0) {
      return {
        result: variants,
        pollCount: attempt,
      }
    }

    const jobEnvelope = extractJobEnvelope(response)
    const status = normalizeStatus(jobEnvelope?.status)

    if (coverCardPollingStatus.failed.has(status)) {
      throw new ToolApiError("远程任务执行失败", 422, response, "REMOTE_JOB_FAILED")
    }

    if (coverCardPollingStatus.success.has(status)) {
      continue
    }

    if (
      attempt < maxPollAttempts &&
      coverCardPollingStatus.pending.has(status || "pending")
    ) {
      await sleep(params.capability.pollIntervalMs, params.signal)
      continue
    }
  }

  return null
}

export async function getCoverCardCapabilities(
  options: CoverCardActionOptions = {}
): Promise<CapabilityResult> {
  const now = Date.now()
  if (capabilityCache && capabilityCache.expiresAt > now) {
    return {
      capability: capabilityCache.capability,
      source: shouldUseToolRemote(options.preferRemote) ? "remote" : "local",
    }
  }

  if (!shouldUseToolRemote(options.preferRemote)) {
    return {
      capability: coverCardDefaultCapability,
      source: "local",
      message: "未配置远程能力接口，使用本地默认配置。",
    }
  }

  try {
    const response = await toolsApiClient.request<unknown>(toolsApiEndpoints.coverCard.capabilities, {
      method: "GET",
      signal: options.signal,
    })

    const capability = parseCapability(response)
    if (!capability) {
      return {
        capability: coverCardDefaultCapability,
        source: "local",
        message: "远程能力返回无效，已回退默认配置。",
      }
    }

    const merged = mergeCapabilityWithDefaults(capability)
    capabilityCache = {
      capability: merged,
      expiresAt: now + 5 * 60 * 1000,
    }

    return {
      capability: merged,
      source: "remote",
      message: "已加载远程能力配置。",
    }
  } catch {
    return {
      capability: coverCardDefaultCapability,
      source: "local",
      message: "远程能力加载失败，已回退默认配置。",
    }
  }
}

export async function generateCoverCardData(
  request: CoverCardGenerateRequest,
  options: CoverCardActionOptions = {}
): Promise<CoverCardGenerateResponse> {
  const startAt = getNow()
  const capabilityResult = await getCoverCardCapabilities(options)
  const capability = capabilityResult.capability
  const {
    payload,
    normalizedRequest,
    normalizedConfig,
    count,
    requestId,
    configHash,
  } = buildCoverCardRemoteGeneratePayload(request, capability)

  let fallbackNotice = ""

  if (shouldUseToolRemote(options.preferRemote)) {
    try {
      const remoteRawResponse = await toolsApiClient.request<unknown>(
        toolsApiEndpoints.coverCard.generate,
        {
          method: "POST",
          body: payload,
          signal: options.signal,
        }
      )

      const direct = extractRemoteVariants(
        remoteRawResponse,
        normalizedRequest,
        normalizedConfig,
        count
      )
      if (direct) {
        return {
          variants: direct.variants,
          selectedVariantId: direct.selectedVariantId,
          source: "remote",
          message: composeNoticeMessage(toolApiCopy.remoteGenerateDone, direct.message),
          meta: buildGenerateMeta({
            requestId,
            configHash,
            config: normalizedConfig,
            startAt,
            capabilitySource: capabilityResult.source,
          }),
        }
      }

      const job = extractJobEnvelope(remoteRawResponse)
      if (
        job?.jobId &&
        (coverCardPollingStatus.pending.has(job.status) ||
          capability.supportsJobFlow)
      ) {
        const polled = await pollRemoteJobResult({
          jobId: job.jobId,
          request: normalizedRequest,
          config: normalizedConfig,
          count,
          capability,
          signal: options.signal,
        })

        if (polled) {
          return {
            variants: polled.result.variants,
            selectedVariantId: polled.result.selectedVariantId,
            source: "remote",
            message: composeNoticeMessage(
              toolApiCopy.remoteGenerateDone,
              [job.message, polled.result.message].filter(Boolean).join("；")
            ),
            meta: buildGenerateMeta({
              requestId,
              configHash,
              config: normalizedConfig,
              startAt,
              capabilitySource: capabilityResult.source,
              jobId: job.jobId,
              pollCount: polled.pollCount,
            }),
          }
        }

        fallbackNotice = "远程任务超时，已回退本地生成。"
      } else {
        fallbackNotice = buildToolApiInvalidPayloadFallbackNotice({
          fallbackTarget: "本地生成",
        })
      }
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

  const local = buildLocalVariants(normalizedRequest, count, normalizedConfig)
  return {
    variants: local.variants,
    selectedVariantId: local.selectedVariantId,
    source: "local",
    message: composeNoticeMessage(toolApiCopy.localGenerateDone, fallbackNotice),
    meta: buildGenerateMeta({
      requestId,
      configHash,
      config: normalizedConfig,
      startAt,
      capabilitySource: capabilityResult.source,
      fallbackUsed: true,
    }),
  }
}

export async function exportCoverCardImage(
  request: CoverCardExportRequest,
  options: CoverCardActionOptions = {}
): Promise<CoverCardExportResult> {
  let fallbackNotice = ""

  if (shouldUseToolRemote(options.preferRemote)) {
    try {
      const remoteBlob = await toolsApiClient.request<Blob, CoverCardExportRequest>(
        toolsApiEndpoints.coverCard.exportImage,
        {
          method: "POST",
          body: request,
          signal: options.signal,
          responseType: "blob",
        }
      )

      return {
        blob: remoteBlob,
        fileName: buildCoverCardImageFileName(
          request.document,
          request.format,
          request.variantId
        ),
        source: "remote",
        fileFormat: request.format,
        message: "远程导出完成",
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        throw error
      }

      if (error instanceof ToolApiError) {
        fallbackNotice = buildToolApiFallbackNotice({
          status: error.status,
          details: error.details,
          fallbackTarget: "本地导出",
        })
      } else {
        fallbackNotice = buildToolApiFallbackNotice({
          status: -1,
          fallbackTarget: "本地导出",
        })
      }
    }
  }

  const localResult = await exportCoverCardImageLocal(request)
  return {
    ...localResult,
    message: composeNoticeMessage(localResult.message || "", fallbackNotice),
  }
}
