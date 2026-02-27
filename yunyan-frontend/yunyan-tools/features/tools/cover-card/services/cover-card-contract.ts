import { z } from "zod"

export const strictVariantDocSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    subtitle: z.string().optional(),
    footer: z.string().optional(),
    badges: z.array(z.string()).optional(),
    themeId: z.string().optional(),
  })
  .passthrough()

export const strictVariantSchema = z
  .object({
    id: z.string().optional(),
    label: z.string().optional(),
    document: strictVariantDocSchema,
    imageUrl: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    seed: z.number().optional(),
    modelId: z.string().optional(),
    latencyMs: z.number().optional(),
    score: z.number().optional(),
  })
  .passthrough()

export const strictGenerateSchema = z
  .object({
    status: z.string().optional(),
    message: z.string().optional(),
    jobId: z.string().optional(),
    selectedVariantId: z.string().optional(),
    variants: z.array(strictVariantSchema).optional(),
  })
  .passthrough()

export const looseCoverCardSchema = z
  .object({
    status: z.unknown().optional(),
    data: z.unknown().optional(),
    card: z.unknown().optional(),
    result: z.unknown().optional(),
    variants: z.unknown().optional(),
    cards: z.unknown().optional(),
    items: z.unknown().optional(),
    selectedVariantId: z.unknown().optional(),
    selected_variant_id: z.unknown().optional(),
    selectedId: z.unknown().optional(),
    jobId: z.unknown().optional(),
    job_id: z.unknown().optional(),
    title: z.unknown().optional(),
    subtitle: z.unknown().optional(),
    description: z.unknown().optional(),
    summary: z.unknown().optional(),
    footer: z.unknown().optional(),
    badges: z.unknown().optional(),
    tags: z.unknown().optional(),
    themeId: z.unknown().optional(),
    theme: z.unknown().optional(),
    msg: z.string().optional(),
    message: z.string().optional(),
  })
  .passthrough()

export const looseCapabilitySchema = z
  .object({
    data: z.unknown().optional(),
    result: z.unknown().optional(),
    models: z.unknown().optional(),
    defaultModelId: z.unknown().optional(),
    maxVariants: z.unknown().optional(),
    maxWidth: z.unknown().optional(),
    maxHeight: z.unknown().optional(),
    supportedRatios: z.unknown().optional(),
    supportsJobFlow: z.unknown().optional(),
    pollIntervalMs: z.unknown().optional(),
    maxPollAttempts: z.unknown().optional(),
  })
  .passthrough()

export const coverCardPollingStatus = {
  pending: new Set(["pending", "queued", "processing", "running", "submitted"]),
  success: new Set(["succeeded", "success", "done", "completed"]),
  failed: new Set(["failed", "error", "canceled", "cancelled"]),
} as const
