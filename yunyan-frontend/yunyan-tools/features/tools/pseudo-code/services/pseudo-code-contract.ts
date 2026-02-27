import { z } from "zod"

import { composeNoticeMessage, toolApiCopy } from "@/features/tools/shared/constants/tool-copy"
import {
  composeVersionNotice,
  readSchemaVersion,
} from "@/features/tools/shared/services/tool-api-schema"
import {
  createPseudoCodeDocumentFromSource,
  resolveRenderConfig,
} from "@/features/tools/pseudo-code/services/pseudo-code-engine"
import type {
  PseudoCodeDocument,
  PseudoCodeGenerateResponse,
} from "@/features/tools/pseudo-code/types/pseudo-code"

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

export function extractPseudoCodeRemoteDocument(
  value: unknown
): PseudoCodeGenerateResponse | null {
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

  const theme = pickString(payload, ["theme"])
  const renderConfig = resolveRenderConfig({
    showLineNumber: pickBoolean(payload, ["showLineNumber", "show_line_number"]),
    hideEndKeywords: pickBoolean(payload, ["hideEndKeywords", "hide_end_keywords"]),
    lineNumberPunc: pickString(payload, ["lineNumberPunc", "line_number_punc"]),
    indentSize: pickNumber(payload, ["indentSize", "indent_size"]),
    titlePrefix: pickString(payload, ["titlePrefix", "title_prefix"]),
    titleCounter: pickNumber(payload, ["titleCounter", "title_counter"]),
    commentDelimiter: pickString(payload, ["commentDelimiter", "comment_delimiter"]),
    theme: theme ? (theme as PseudoCodeDocument["renderConfig"]["theme"]) : undefined,
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
