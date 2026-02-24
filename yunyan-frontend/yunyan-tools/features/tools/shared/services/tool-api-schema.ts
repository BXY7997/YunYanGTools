import { z } from "zod"

export const toolApiEnvelopeSchema = z
  .object({
    version: z.string().trim().min(1).optional(),
    code: z.number().optional(),
    msg: z.string().optional(),
    message: z.string().optional(),
    data: z.unknown().optional(),
  })
  .passthrough()

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

export function readSchemaVersion(value: unknown) {
  const source = toRecord(value)
  if (!source) {
    return undefined
  }

  const rawVersion = source.version
  if (typeof rawVersion !== "string") {
    return undefined
  }

  const version = rawVersion.trim()
  return version || undefined
}

export function composeVersionNotice(version: string | undefined) {
  return version
    ? `远程响应版本：${version}`
    : "远程响应缺少version字段，已按兼容模式解析"
}

export function isRecordLike(value: unknown): value is Record<string, unknown> {
  return toRecord(value) !== null
}
