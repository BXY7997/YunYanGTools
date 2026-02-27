import { z } from "zod"

import { courseCodeLanguageOptions } from "@/features/tools/code-runner/constants/code-runner-config"
import {
  buildCourseCodeTitle,
  createCourseCodeRunnerCode,
  simulateCourseCodeRun,
} from "@/features/tools/code-runner/services/code-runner-model"
import { toolsApiEndpoints } from "@/features/tools/shared/constants/api-config"
import {
  buildToolApiFallbackNotice,
  buildToolApiInvalidPayloadFallbackNotice,
  composeNoticeMessage,
} from "@/features/tools/shared/constants/tool-copy"
import {
  ToolApiError,
  toolsApiClient,
} from "@/features/tools/shared/services/tool-api-client"
import { shouldUseToolRemote } from "@/features/tools/shared/services/tool-api-runtime"
import type {
  CourseCodeExportRequest,
  CourseCodeExportResult,
  CourseCodeGenerateRequest,
  CourseCodeGenerateResponse,
  CourseCodeRunResponse,
  CourseCodeRunResult,
  CourseCodeRunRequest,
} from "@/features/tools/code-runner/types/code-runner"

interface CourseCodeActionOptions {
  preferRemote?: boolean
  signal?: AbortSignal
}

const remoteRunSchema = z
  .object({
    msg: z.string().optional(),
    message: z.string().optional(),
    data: z.unknown().optional(),
    result: z.unknown().optional(),
    output: z.unknown().optional(),
    errorOutput: z.unknown().optional(),
    runtimeMs: z.unknown().optional(),
    memoryKb: z.unknown().optional(),
    status: z.unknown().optional(),
    warnings: z.unknown().optional(),
    logs: z.unknown().optional(),
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
  }

  return []
}

function normalizeRunStatus(value: unknown): CourseCodeRunResult["status"] {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    if (normalized === "error" || normalized === "failed") {
      return "error"
    }
  }
  return "success"
}

function parseRemoteRun(value: unknown): {
  result: CourseCodeRunResult
  message: string
} | null {
  const parsed = remoteRunSchema.safeParse(value)
  if (!parsed.success) {
    return null
  }

  const root = parsed.data
  const candidates = [toRecord(root), toRecord(root.data), toRecord(root.result)].filter(
    (item): item is Record<string, unknown> => Boolean(item)
  )

  for (const candidate of candidates) {
    const output = pickString(candidate, ["output", "stdout", "result", "log"])
    const errorOutput =
      pickString(candidate, ["errorOutput", "stderr", "error", "err"]) || undefined
    const runtimeMs = pickNumber(candidate, ["runtimeMs", "durationMs", "costMs"])
    const memoryKb = pickNumber(candidate, ["memoryKb", "memory", "memory_usage"])
    const warnings = pickStringArray(candidate, ["warnings", "warningList"])
    const logs = pickStringArray(candidate, ["logs", "logLines"])
    const hasStatusSignal =
      typeof candidate.status === "string" && candidate.status.trim().length > 0
    const hasRunSignal =
      Boolean(output) ||
      Boolean(errorOutput) ||
      hasStatusSignal ||
      runtimeMs !== undefined ||
      memoryKb !== undefined ||
      warnings.length > 0 ||
      logs.length > 0

    if (!hasRunSignal) {
      continue
    }

    return {
      result: {
        status: normalizeRunStatus(candidate.status || (errorOutput ? "error" : "success")),
        output: output || "",
        errorOutput,
        runtimeMs: Math.max(1, Math.round(runtimeMs || 60)),
        memoryKb: Math.max(512, Math.round(memoryKb || 4096)),
        warnings,
        logs,
      },
      message:
        pickString(toRecord(root), ["message", "msg"]) ||
        pickString(candidate, ["message", "msg"]),
    }
  }

  return null
}

function resolveLanguageExtension(language: CourseCodeExportRequest["language"]) {
  return (
    courseCodeLanguageOptions.find((item) => item.value === language)?.extension ||
    "txt"
  )
}

function normalizeFileSegment(value: string | undefined, fallback: string) {
  const raw = (value || "").trim()
  if (!raw) {
    return fallback
  }
  return raw
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 48)
}

export function buildCourseCodeFileName(request: CourseCodeExportRequest) {
  const title = normalizeFileSegment(request.title, "code-runner")
  const extension = resolveLanguageExtension(request.language)
  return `${title}.${extension}`
}

function createSourceBlob(code: string, language: CourseCodeExportRequest["language"]) {
  const mime =
    language === "JAVA"
      ? "text/x-java-source"
      : language === "Python3"
        ? "text/x-python"
        : "text/plain"
  return new Blob([code], { type: `${mime};charset=utf-8` })
}

export async function generateCourseCodeData(
  request: CourseCodeGenerateRequest,
  _options: CourseCodeActionOptions = {}
): Promise<CourseCodeGenerateResponse> {
  return {
    code: createCourseCodeRunnerCode(request.language, request.code),
    title: buildCourseCodeTitle(request.language),
    source: "local",
    message: "已加载语言示例代码",
  }
}

export async function runCourseCodeData(
  request: CourseCodeRunRequest,
  options: CourseCodeActionOptions = {}
): Promise<CourseCodeRunResponse> {
  let fallbackNotice = ""

  if (shouldUseToolRemote(options.preferRemote)) {
    try {
      const response = await toolsApiClient.request<unknown>(toolsApiEndpoints.codeRunner.run, {
        method: "POST",
        body: request,
        signal: options.signal,
      })

      const parsed = parseRemoteRun(response)
      if (parsed) {
        return {
          result: parsed.result,
          source: "remote",
          message: composeNoticeMessage("远程运行完成", parsed.message),
        }
      }

      fallbackNotice = buildToolApiInvalidPayloadFallbackNotice({
        fallbackTarget: "本地模拟运行",
      })
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        throw error
      }

      if (error instanceof ToolApiError) {
        fallbackNotice = buildToolApiFallbackNotice({
          status: error.status,
          details: error.details,
          fallbackTarget: "本地模拟运行",
        })
      } else {
        fallbackNotice = buildToolApiFallbackNotice({
          status: -1,
          fallbackTarget: "本地模拟运行",
        })
      }
    }
  }

  return {
    result: simulateCourseCodeRun(request),
    source: "local",
    message: composeNoticeMessage("本地模拟运行完成", fallbackNotice),
  }
}

export async function exportCourseCodeFile(
  request: CourseCodeExportRequest,
  options: CourseCodeActionOptions = {}
): Promise<CourseCodeExportResult> {
  let fallbackNotice = ""

  if (shouldUseToolRemote(options.preferRemote)) {
    try {
      const remoteBlob = await toolsApiClient.request<Blob, CourseCodeExportRequest>(
        toolsApiEndpoints.codeRunner.exportCode,
        {
          method: "POST",
          body: request,
          signal: options.signal,
          responseType: "blob",
        }
      )

      return {
        blob: remoteBlob,
        fileName: buildCourseCodeFileName(request),
        source: "remote",
        message: "远程源码导出完成",
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        throw error
      }

      if (error instanceof ToolApiError) {
        fallbackNotice = buildToolApiFallbackNotice({
          status: error.status,
          details: error.details,
          fallbackTarget: "本地源码导出",
        })
      } else {
        fallbackNotice = buildToolApiFallbackNotice({
          status: -1,
          fallbackTarget: "本地源码导出",
        })
      }
    }
  }

  return {
    blob: createSourceBlob(request.code, request.language),
    fileName: buildCourseCodeFileName(request),
    source: "local",
    message: composeNoticeMessage("本地源码导出完成", fallbackNotice),
  }
}
