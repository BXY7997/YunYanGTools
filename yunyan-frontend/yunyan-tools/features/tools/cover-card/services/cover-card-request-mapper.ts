import {
  coverCardDefaultCapability,
  coverCardDimensionLimits,
  coverCardDefaultGenerationConfig,
  coverCardVariantLimits,
} from "@/features/tools/cover-card/constants/cover-card-config"
import {
  normalizeCoverCardGenerationConfig,
  normalizeCoverCardVariantCount,
} from "@/features/tools/cover-card/services/cover-card-model"
import type {
  CoverCardCapability,
  CoverCardGenerateRequest,
  CoverCardGenerationConfig,
} from "@/features/tools/cover-card/types/cover-card"

interface CoverCardRemoteGeneratePayload {
  requestId: string
  configHash: string
  prompt: string
  count: number
  layout: {
    ratio: CoverCardGenerateRequest["ratio"]
    width: number
    height: number
  }
  style: {
    themeId?: CoverCardGenerateRequest["themeId"]
    negativePrompt: string
    seed?: number
  }
  model: {
    provider: string
    modelId: string
    quality: CoverCardGenerationConfig["quality"]
  }
  options: {
    includePreviewMeta: boolean
  }
}

function clampInteger(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)))
}

function hashString(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16)
}

export function createCoverCardRequestId() {
  if (typeof window !== "undefined" && typeof window.crypto?.randomUUID === "function") {
    return window.crypto.randomUUID()
  }

  const randomChunk = Math.random().toString(36).slice(2, 10)
  return `cover-card-${Date.now()}-${randomChunk}`
}

export function clampCoverCardVariantCountByCapability(
  count: number | undefined,
  capability: CoverCardCapability
) {
  return Math.min(
    normalizeCoverCardVariantCount(count),
    Math.max(coverCardVariantLimits.min, capability.maxVariants)
  )
}

function resolveCoverCardRatioByCapability(
  ratio: CoverCardGenerateRequest["ratio"],
  capability: CoverCardCapability
) {
  const supported = capability.supportedRatios.filter(Boolean)
  if (supported.includes(ratio)) {
    return ratio
  }
  return supported[0] || ratio
}

export function normalizeCoverCardRequestByCapability(
  request: CoverCardGenerateRequest,
  capability: CoverCardCapability
): CoverCardGenerateRequest {
  const maxWidth = clampInteger(
    capability.maxWidth,
    coverCardDimensionLimits.minWidth,
    coverCardDimensionLimits.maxWidth
  )
  const maxHeight = clampInteger(
    capability.maxHeight,
    coverCardDimensionLimits.minHeight,
    coverCardDimensionLimits.maxHeight
  )

  return {
    ...request,
    ratio: resolveCoverCardRatioByCapability(request.ratio, capability),
    width: clampInteger(request.width, coverCardDimensionLimits.minWidth, maxWidth),
    height: clampInteger(request.height, coverCardDimensionLimits.minHeight, maxHeight),
    count: clampCoverCardVariantCountByCapability(request.count, capability),
  }
}

export function resolveCoverCardModelByCapability(
  capability: CoverCardCapability,
  modelId: string | undefined
) {
  const models = capability.models.length > 0 ? capability.models : coverCardDefaultCapability.models
  const selected = models.find((item) => item.id === modelId)
  if (selected) {
    return selected
  }

  const fallback = models.find((item) => item.id === capability.defaultModelId)
  return fallback || models[0] || coverCardDefaultCapability.models[0]
}

export function normalizeCoverCardConfigByCapability(
  request: CoverCardGenerateRequest,
  capability: CoverCardCapability
) {
  const normalized = normalizeCoverCardGenerationConfig(request.config)
  const model = resolveCoverCardModelByCapability(capability, normalized.modelId)

  return {
    ...normalized,
    modelId: model?.id || coverCardDefaultGenerationConfig.modelId,
    provider: model?.provider || coverCardDefaultGenerationConfig.provider,
  }
}

export function buildCoverCardConfigHash(
  request: CoverCardGenerateRequest,
  normalizedConfig: CoverCardGenerationConfig,
  count: number
) {
  const raw = JSON.stringify({
    prompt: request.prompt.trim(),
    ratio: request.ratio,
    width: request.width,
    height: request.height,
    themeId: request.themeId || "",
    count,
    modelId: normalizedConfig.modelId,
    provider: normalizedConfig.provider,
    negativePrompt: normalizedConfig.negativePrompt,
    seed: normalizedConfig.seed ?? null,
    quality: normalizedConfig.quality,
  })

  return hashString(raw)
}

export function buildCoverCardRemoteGeneratePayload(
  request: CoverCardGenerateRequest,
  capability: CoverCardCapability
): {
  payload: CoverCardRemoteGeneratePayload
  normalizedRequest: CoverCardGenerateRequest
  normalizedConfig: CoverCardGenerationConfig
  count: number
  requestId: string
  configHash: string
} {
  const normalizedRequest = normalizeCoverCardRequestByCapability(request, capability)
  const normalizedConfig = normalizeCoverCardConfigByCapability(normalizedRequest, capability)
  const count = normalizedRequest.count || coverCardVariantLimits.defaultPrimary
  const requestId = normalizedRequest.requestId || createCoverCardRequestId()
  const configHash = buildCoverCardConfigHash(normalizedRequest, normalizedConfig, count)

  return {
    payload: {
      requestId,
      configHash,
      prompt: normalizedRequest.prompt,
      count,
      layout: {
        ratio: normalizedRequest.ratio,
        width: normalizedRequest.width,
        height: normalizedRequest.height,
      },
      style: {
        themeId: normalizedRequest.themeId,
        negativePrompt: normalizedConfig.negativePrompt,
        seed: normalizedConfig.seed,
      },
      model: {
        provider: normalizedConfig.provider,
        modelId: normalizedConfig.modelId,
        quality: normalizedConfig.quality,
      },
      options: {
        includePreviewMeta: true,
      },
    },
    normalizedRequest,
    normalizedConfig,
    count,
    requestId,
    configHash,
  }
}
